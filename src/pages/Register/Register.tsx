import { useState } from 'react'
import { Button, Card, Container, Form, Alert } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router'
import { Wallet2 } from 'react-bootstrap-icons'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      })

      if (!response.ok) {
        let errorMsg = 'Erro ao criar conta'
        try {
          const errorData = await response.json()
          errorMsg = errorData.message || errorData.error || errorMsg
        } catch (e) {
          // Response is not JSON
        }
        throw new Error(errorMsg)
      }

      navigate('/login', { 
        state: { successMessage: 'Conta criada com sucesso! Por favor, faça login para acessar o sistema.' } 
      })
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
            <h2 className="fw-bold">Criar Conta</h2>
            <p className="text-muted">Comece a gerenciar suas finanças agora</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Conta criada com sucesso! Redirecionando...</Alert>}

          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

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
                placeholder="Crie uma senha forte"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button
              variant="dark"
              type="submit"
              className="w-100 btn-black py-2 fw-medium"
              disabled={loading || success}
            >
              {loading ? 'Criando conta...' : 'Registrar'}
            </Button>
          </Form>

          <div className="text-center mt-4">
            <p className="mb-0 text-muted">
              Já tem uma conta? <Link to="/login" className="text-dark fw-bold text-decoration-none">Faça login</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Register
