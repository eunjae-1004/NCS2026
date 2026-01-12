import express from 'express'
import { query } from '../db.js'
import crypto from 'crypto'

const router = express.Router()

// 간단한 비밀번호 해시 함수 (실제 운영에서는 bcrypt 사용 권장)
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// 비밀번호 검증
const verifyPassword = (password, hash) => {
  return hashPassword(password) === hash
}

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, organizationId, industryCode, departmentCode, jobCode } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: '이메일, 비밀번호, 이름이 필요합니다.',
      })
    }

    // 이메일 형식 검증 (간단한 검증)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: '올바른 이메일 형식이 아닙니다.',
      })
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: '비밀번호는 최소 6자 이상이어야 합니다.',
      })
    }

    // 이메일 중복 확인
    const checkEmailQuery = `SELECT id FROM users WHERE email = $1`
    const existingUser = await query(checkEmailQuery, [email])

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: '이미 등록된 이메일입니다.',
      })
    }

    // 사용자 ID 생성 (이메일 기반 해시)
    const userId = `user_${crypto.createHash('sha256').update(email).digest('hex').substring(0, 16)}`
    const passwordHash = hashPassword(password)

    // 사용자 생성
    const insertQuery = `
      INSERT INTO users (id, email, password_hash, name, organization_id, role, industry_code, department_code, job_code, created_at)
      VALUES ($1, $2, $3, $4, $5, 'user', $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING id, email, name, organization_id, role, industry_code, department_code, job_code, created_at
    `

    const result = await query(insertQuery, [
      userId,
      email,
      passwordHash,
      name,
      organizationId || null,
      industryCode || null,
      departmentCode || null,
      jobCode || null,
    ])

    const user = result.rows[0]

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        organization: user.organization_id,
        role: user.role,
        industryCode: user.industry_code,
        departmentCode: user.department_code,
        jobCode: user.job_code,
      },
    })
  } catch (error) {
    console.error('회원가입 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '회원가입 중 오류가 발생했습니다.',
    })
  }
})

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '이메일과 비밀번호가 필요합니다.',
      })
    }

    // 사용자 조회
    const userQuery = `
      SELECT id, email, password_hash, name, organization_id, role, industry_code, department_code, job_code, created_at
      FROM users
      WHERE email = $1
    `

    const result = await query(userQuery, [email])

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.',
      })
    }

    const user = result.rows[0]

    // 비밀번호 검증
    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.',
      })
    }

    // 기관 정보 조회 (있는 경우)
    let organization = null
    if (user.organization_id) {
      const orgQuery = `SELECT name, type FROM organizations WHERE id = $1`
      const orgResult = await query(orgQuery, [user.organization_id])
      if (orgResult.rows.length > 0) {
        organization = orgResult.rows[0].name
      }
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        organization,
        role: user.role || 'user',
        industryCode: user.industry_code,
        departmentCode: user.department_code,
        jobCode: user.job_code,
      },
    })
  } catch (error) {
    console.error('로그인 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '로그인 중 오류가 발생했습니다.',
    })
  }
})

// Guest 사용자 생성 (검색만 가능)
router.post('/guest', async (req, res) => {
  try {
    const { name } = req.body

    // Guest ID 생성 (임시 세션 기반)
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Guest 사용자 생성 (이메일 없음)
    const insertQuery = `
      INSERT INTO users (id, name, role, created_at)
      VALUES ($1, $2, 'guest', CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING
      RETURNING id, name, role, created_at
    `

    const result = await query(insertQuery, [guestId, name || '게스트'])

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        role: 'guest',
      },
    })
  } catch (error) {
    console.error('Guest 생성 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Guest 생성 중 오류가 발생했습니다.',
    })
  }
})

export default router


