import { useState, useEffect } from 'react'
import { Container, Button, Table, Modal, Form, Alert, Spinner, Card, Row, Col } from 'react-bootstrap'
import { PlusCircle, PencilSquare, Trash, Wallet2, GraphUp } from 'react-bootstrap-icons'
import { useNavigate } from 'react-router'
import Header from '../../components/Header/Header'

interface Account {
  id: string
  name: string
  balance: number
}

const Accounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState({ name: '', balance: 0 })

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
  const token = localStorage.getItem('token')

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Erro ao buscar contas')
      const data = await response.json()
      setAccounts(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleOpenModal = (account: Account | null = null) => {
    if (account) {
      setCurrentAccount(account)
      setFormData({ name: account.name, balance: account.balance })
    } else {
      setCurrentAccount(null)
      setFormData({ name: '', balance: 0 })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalLoading(true)
    setError('')

    const method = currentAccount ? 'PUT' : 'POST'
    const url = currentAccount
      ? `${baseUrl}/accounts/${currentAccount.id}`
      : `${baseUrl}/accounts`

    const payload = currentAccount ? formData : { name: formData.name }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Erro ao salvar conta')

      handleCloseModal()
      fetchAccounts()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta conta?')) return

    try {
      const response = await fetch(`${baseUrl}/accounts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Erro ao excluir conta')
      fetchAccounts()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <>
      <Header />
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Minhas Contas</h2>
          <Button variant="dark" className="btn-black d-flex align-items-center gap-2" onClick={() => handleOpenModal()}>
            <PlusCircle /> Nova Conta
          </Button>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <Row>
            {accounts.length === 0 ? (
              <Col xs={12}>
                <p className="text-center py-4 text-muted bg-white rounded shadow-sm">Nenhuma conta encontrada</p>
              </Col>
            ) : (
              accounts.map((acc) => (
                <Col md={6} lg={4} key={acc.id} className="mb-4">
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <Wallet2 size={32} className="bg-dark text-white p-2 rounded-2" />
                        <div className="d-flex gap-1">
                          <Button variant="light" size="sm" onClick={() => handleOpenModal(acc)}>
                            <PencilSquare />
                          </Button>
                          <Button variant="light" size="sm" className="text-danger" onClick={() => handleDelete(acc.id)}>
                            <Trash />
                          </Button>
                        </div>
                      </div>
                      <Card.Title className="fw-bold">{acc.name}</Card.Title>
                      <Card.Text className="text-muted mb-4">Saldo Disponível</Card.Text>
                      <h4 className="fw-bold mb-4">{formatCurrency(acc.balance)}</h4>
                      <Button
                        variant="outline-dark"
                        className="w-100 d-flex align-items-center justify-content-center gap-2"
                        onClick={() => navigate(`/investments/new?accountId=${acc.id}`)}
                      >
                        <GraphUp /> Investir
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        )}
      </Container>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{currentAccount ? 'Editar Conta' : 'Nova Conta'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="accountName">
              <Form.Label>Nome da Conta</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: Carteira, Banco Inter..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="accountBalance">
              <Form.Label>Saldo Inicial</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={handleCloseModal}>Cancelar</Button>
            <Button variant="dark" className="btn-black" type="submit" disabled={modalLoading}>
              {modalLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default Accounts
