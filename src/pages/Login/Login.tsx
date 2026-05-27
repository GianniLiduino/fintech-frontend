import { useState } from 'react'
import { Button, Card, Container, Form, Alert } from 'react-bootstrap'
import { useNavigate, Link, useLocation } from 'react-router'
import { Wallet2 } from 'react-bootstrap-icons'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.successMessage

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        let errorMsg = 'Email ou senha inválidos'
        try {
          const errorData = await response.json()
          errorMsg = errorData.message || errorData.error || errorMsg
        } catch (e) {
          // Response is not JSON
        }
        throw new Error(errorMsg)
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)
      
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Card className="p-4 shadow-sm border-0" style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Body>
          <div className="text-center mb-4 d-flex flex-column align-items-center">
            <Wallet2 size={48} className="bg-dark text-white p-2 rounded-2 mb-3" />
            <h2 className="fw-bold">Login</h2>
            <p className="text-muted">Acesse sua conta GianniXP</p>
          </div>

          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ex: gianni@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formPassword">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button
              variant="dark"
              type="submit"
              className="w-100 btn-black py-2 fw-medium"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Form>

          <div className="text-center mt-4">
            <p className="mb-0 text-muted">
              Não tem uma conta? <Link to="/register" className="text-dark fw-bold text-decoration-none">Registre-se</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Login
