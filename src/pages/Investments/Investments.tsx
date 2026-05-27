import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button, Card, Spinner, Alert, Badge } from 'react-bootstrap'
import { GraphUp, Trash, BoxArrowUpRight, Cash, Calendar, Wallet2 } from 'react-bootstrap-icons'
import Header from '../../components/Header/Header'

interface Investment {
  id: string
  name: string
  amount: number
  date: string
  type: string
  account: { id: string, name: string }
}

interface Account {
  id: string
  name: string
}

const Investments = () => {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
  const token = localStorage.getItem('token')

  const fetchData = async () => {
    setLoading(true)
    try {
      const headers = { 'Authorization': `Bearer ${token}` }
      const [invRes, accRes] = await Promise.all([
        fetch(`${baseUrl}/investments`, { headers }),
        fetch(`${baseUrl}/accounts`, { headers })
      ])

      if (invRes.ok) setInvestments(await invRes.json())
      if (accRes.ok) setAccounts(await accRes.json())
    } catch (err: any) {
      setError('Erro ao carregar investimentos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este investimento?')) return
    try {
      // Nota: Verificando se o endpoint de delete existe. No PRO+ existia.
      const response = await fetch(`${baseUrl}/investments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) fetchData()
    } catch (err) {
      setError('Erro ao excluir investimento.')
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
        <h2 className="fw-bold mb-4">Meus Investimentos</h2>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" /></div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {investments.length === 0 ? (
              <Card className="border-0 shadow-sm p-5 text-center">
                <GraphUp size={48} className="text-muted mb-3 mx-auto" />
                <p className="text-muted mb-0">Você ainda não possui investimentos registrados.</p>
              </Card>
            ) : (
              investments.map(inv => (
                <Card key={inv.id} className="border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center gap-3">
                      <GraphUp size={40} className="bg-dark text-white rounded-circle p-2 flex-shrink-0" />
                      <div className="d-flex flex-column overflow-hidden flex-grow-1">
                        <span className="fw-bold text-truncate">{inv.name}</span>
                        <div className="d-flex align-items-center gap-2">
                           <Badge bg="light" className="text-muted border fw-normal">{inv.type}</Badge>
                           <span className="text-muted small">• {inv.account?.name || 'Conta desconhecida'}</span>
                           <span className="text-muted small">• {formatDate(inv.date)}</span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <span className="mb-0 fw-bold fs-5 text-dark">
                          {formatCurrency(inv.amount)}
                        </span>
                        <Button variant="light" size="sm" className="text-muted" onClick={() => handleDelete(inv.id)}>
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>
        )}
      </Container>
    </>
  )
}

export default Investments
