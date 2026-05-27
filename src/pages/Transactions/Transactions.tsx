import { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Form, Button, Card, Spinner, Alert, Badge } from 'react-bootstrap'
import { ArrowDownRight, ArrowUpRight, Funnel, Trash, XCircle } from 'react-bootstrap-icons'
import Header from '../../components/Header/Header'

interface Transaction {
  id: string
  name: string
  amount: number
  date: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER_IN' | 'TRANSFER_OUT'
  account: { id: string, name: string }
  category: { id: string, name: string }
}

interface Account {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  type: string
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter States
  const [accountId, setAccountId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
  const token = localStorage.getItem('token')

  const fetchData = async () => {
    setLoading(true)
    try {
      const headers = { 'Authorization': `Bearer ${token}` }
      
      const queryParams = new URLSearchParams()
      if (accountId) queryParams.append('accountId', accountId)
      if (startDate) queryParams.append('startDate', startDate)
      if (endDate) queryParams.append('endDate', endDate)
      if (minAmount) queryParams.append('minAmount', minAmount)
      if (maxAmount) queryParams.append('maxAmount', maxAmount)

      const [txRes, accRes, catRes] = await Promise.all([
        fetch(`${baseUrl}/transactions?${queryParams.toString()}`, { headers }),
        fetch(`${baseUrl}/accounts`, { headers }),
        fetch(`${baseUrl}/categories`, { headers })
      ])

      if (txRes.ok) setTransactions(await txRes.json())
      if (accRes.ok) setAccounts(await accRes.json())
      if (catRes.ok) setCategories(await catRes.json())
    } catch (err: any) {
      setError('Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [accountId, startDate, endDate, minAmount, maxAmount])

  const filteredTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions])

  const clearFilters = () => {
    setAccountId('')
    setStartDate('')
    setEndDate('')
    setMinAmount('')
    setMaxAmount('')
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir esta transação?')) return
    try {
      const response = await fetch(`${baseUrl}/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) fetchData()
    } catch (err) {
      setError('Erro ao excluir transação.')
    }
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
    return d.toLocaleDateString('pt-BR')
  }

  return (
    <>
      <Header />
      <Container className="py-5">
        <h2 className="fw-bold mb-4">Minhas Transações</h2>

        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-3">
              <Funnel className="me-2 text-muted" size={18} />
              <span className="fw-bold text-muted small text-uppercase">Filtros</span>
            </div>
            
            <Form>
              <Row className="g-3">
                <Col md={4} lg={3}>
                  <Form.Group>
                    <Form.Label className="small fw-medium">Conta</Form.Label>
                    <Form.Select size="sm" value={accountId} onChange={e => setAccountId(e.target.value)}>
                      <option value="">Todas as contas</option>
                      {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} lg={2}>
                  <Form.Group>
                    <Form.Label className="small fw-medium">Data Inicial</Form.Label>
                    <Form.Control size="sm" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={4} lg={2}>
                  <Form.Group>
                    <Form.Label className="small fw-medium">Data Final</Form.Label>
                    <Form.Control size="sm" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6} lg={2}>
                  <Form.Group>
                    <Form.Label className="small fw-medium">Valor Min.</Form.Label>
                    <Form.Control size="sm" type="number" placeholder="0.00" value={minAmount} onChange={e => setMinAmount(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6} lg={2}>
                  <Form.Group>
                    <Form.Label className="small fw-medium">Valor Max.</Form.Label>
                    <Form.Control size="sm" type="number" placeholder="9999..." value={maxAmount} onChange={e => setMaxAmount(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col lg={1} className="d-flex align-items-end justify-content-end">
                   <Button variant="link" className="text-muted p-0 small text-decoration-none d-flex align-items-center gap-1" onClick={clearFilters}>
                      <XCircle size={14} /> Limpar
                   </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" /></div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filteredTransactions.length === 0 ? (
              <Card className="border-0 shadow-sm p-5 text-center">
                <p className="text-muted mb-0">Nenhuma transação encontrada com os filtros selecionados.</p>
              </Card>
            ) : (
              filteredTransactions.map(tx => {
                const isReceita = tx.type === 'INCOME' || tx.type === 'TRANSFER_IN'

                return (
                  <Card key={tx.id} className="border-0 shadow-sm">
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-center gap-3">
                        {isReceita ? (
                          <ArrowUpRight size={40} className="bg-success-subtle rounded-circle p-2 text-success flex-shrink-0" />
                        ) : (
                          <ArrowDownRight size={40} className="bg-danger-subtle rounded-circle p-2 text-danger flex-shrink-0" />
                        )}
                        <div className="d-flex flex-column overflow-hidden flex-grow-1">
                          <span className="fw-bold text-truncate">{tx.name}</span>
                          <div className="d-flex align-items-center gap-2">
                             <Badge bg="light" className="text-muted border fw-normal">{tx.category?.name || 'Sem categoria'}</Badge>
                             <span className="text-muted small">• {tx.account?.name || 'Conta desconhecida'}</span>
                             <span className="text-muted small">• {formatDate(tx.date)}</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <span className={`mb-0 fw-bold fs-5 ${isReceita ? 'text-success' : 'text-danger'}`}>
                            {isReceita ? '+' : '-'} {formatCurrency(Math.abs(tx.amount))}
                          </span>
                          <Button variant="light" size="sm" className="text-muted" onClick={() => handleDelete(tx.id)}>
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </Container>
    </>
  )
}

export default Transactions
