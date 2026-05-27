import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, ProgressBar, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap'
import { PlusCircle, Bullseye, Calendar, Cash, ArrowRight, Wallet2 } from 'react-bootstrap-icons'
import Header from '../../components/Header/Header'

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
}

interface Account {
  id: string
  name: string
  balance: number
}

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal Create Goal
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalLoading, setGoalLoading] = useState(false)
  const [goalFormData, setGoalFormData] = useState({ name: '', targetAmount: 0, deadline: '' })

  // Modal Deposit
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [depositLoading, setDepositLoading] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [depositFormData, setDepositFormData] = useState({ amount: 0, date: new Date().toISOString().split('T')[0], accountId: '' })

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
  const token = localStorage.getItem('token')

  const fetchData = async () => {
    setLoading(true)
    try {
      const headers = { 'Authorization': `Bearer ${token}` }
      const [goalRes, accRes] = await Promise.all([
        fetch(`${baseUrl}/goals`, { headers }),
        fetch(`${baseUrl}/accounts`, { headers })
      ])

      if (goalRes.ok) setGoals(await goalRes.json())
      if (accRes.ok) {
        const accData = await accRes.json()
        setAccounts(accData)
        if (accData.length > 0) setDepositFormData(prev => ({ ...prev, accountId: accData[0].id }))
      }
    } catch (err) {
      setError('Erro ao carregar metas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    setGoalLoading(true)
    try {
      const response = await fetch(`${baseUrl}/goals`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(goalFormData)
      })
      if (response.ok) {
        setShowGoalModal(false)
        setGoalFormData({ name: '', targetAmount: 0, deadline: '' })
        fetchData()
      }
    } catch (err) {
      setError('Erro ao criar meta.')
    } finally {
      setGoalLoading(false)
    }
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoal) return
    setDepositLoading(true)
    try {
      const response = await fetch(`${baseUrl}/goals/deposit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ...depositFormData, goalId: selectedGoal.id })
      })
      if (response.ok) {
        setShowDepositModal(false)
        setDepositFormData(prev => ({ ...prev, amount: 0 }))
        fetchData()
      }
    } catch (err) {
      setError('Erro ao realizar depósito.')
    } finally {
      setDepositLoading(false)
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Minhas Metas</h2>
          <Button variant="dark" className="btn-black d-flex align-items-center gap-2" onClick={() => setShowGoalModal(true)}>
            <PlusCircle /> Nova Meta
          </Button>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" /></div>
        ) : (
          <Row className="g-4">
            {goals.length === 0 ? (
              <Col xs={12}>
                <Card className="border-0 shadow-sm p-5 text-center">
                  <Bullseye size={48} className="text-muted mb-3 mx-auto" />
                  <p className="text-muted mb-0">Você ainda não tem metas cadastradas. Comece planejando um objetivo!</p>
                </Card>
              </Col>
            ) : (
              goals.map(goal => {
                const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                return (
                  <Col md={6} lg={4} key={goal.id}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                           <Badge bg="dark" className="px-3 py-2 rounded-2">
                              <Bullseye className="me-2" /> Meta
                           </Badge>
                           <small className="text-muted d-flex align-items-center gap-1">
                              <Calendar size={14} /> {formatDate(goal.deadline)}
                           </small>
                        </div>
                        <h4 className="fw-bold mb-1">{goal.name}</h4>
                        <p className="text-muted small mb-4">Progresso da meta</p>
                        
                        <div className="mb-4">
                           <div className="d-flex justify-content-between small fw-bold mb-2">
                              <span>{formatCurrency(goal.currentAmount)}</span>
                              <span>{formatCurrency(goal.targetAmount)}</span>
                           </div>
                           <ProgressBar variant={progress === 100 ? 'success' : 'dark'} now={progress} style={{ height: '10px' }} className="rounded-pill" />
                           <div className="text-end mt-1">
                              <small className="fw-bold">{progress.toFixed(0)}% concluído</small>
                           </div>
                        </div>

                        <Button 
                           variant="outline-dark" 
                           className="w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-medium"
                           onClick={() => {
                              setSelectedGoal(goal)
                              setShowDepositModal(true)
                           }}
                        >
                           <Cash /> Depositar
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                )
              })
            )}
          </Row>
        )}
      </Container>

      {/* Modal Create Goal */}
      <Modal show={showGoalModal} onHide={() => setShowGoalModal(false)} centered>
        <Form onSubmit={handleCreateGoal}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold">Nova Meta</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome do Objetivo</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Ex: Viagem, Carro Novo, Reserva..." 
                required 
                value={goalFormData.name}
                onChange={e => setGoalFormData({...goalFormData, name: e.target.value})}
              />
            </Form.Group>
            <Row>
               <Col sm={6}>
                  <Form.Group className="mb-3">
                     <Form.Label>Valor Alvo (R$)</Form.Label>
                     <Form.Control 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        required 
                        value={goalFormData.targetAmount}
                        onChange={e => setGoalFormData({...goalFormData, targetAmount: parseFloat(e.target.value)})}
                     />
                  </Form.Group>
               </Col>
               <Col sm={6}>
                  <Form.Group className="mb-3">
                     <Form.Label>Data Limite</Form.Label>
                     <Form.Control 
                        type="date" 
                        required 
                        value={goalFormData.deadline}
                        onChange={e => setGoalFormData({...goalFormData, deadline: e.target.value})}
                     />
                  </Form.Group>
               </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowGoalModal(false)}>Cancelar</Button>
            <Button variant="dark" className="btn-black" type="submit" disabled={goalLoading}>
               {goalLoading ? 'Criando...' : 'Criar Meta'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Deposit */}
      <Modal show={showDepositModal} onHide={() => setShowDepositModal(false)} centered>
         <Form onSubmit={handleDeposit}>
            <Modal.Header closeButton>
               <Modal.Title className="fw-bold">Depositar na Meta</Modal.Title>
            </Modal.Header>
            <Modal.Body>
               <div className="bg-light p-3 rounded-3 mb-4 d-flex align-items-center gap-3">
                  <Bullseye size={32} className="text-dark" />
                  <div>
                     <p className="mb-0 small text-muted">Meta Selecionada</p>
                     <h6 className="mb-0 fw-bold">{selectedGoal?.name}</h6>
                  </div>
               </div>

               <Row>
                  <Col sm={6}>
                     <Form.Group className="mb-3">
                        <Form.Label>Valor do Depósito (R$)</Form.Label>
                        <Form.Control 
                           type="number" 
                           step="0.01" 
                           placeholder="0.00" 
                           required 
                           value={depositFormData.amount}
                           onChange={e => setDepositFormData({...depositFormData, amount: parseFloat(e.target.value)})}
                        />
                     </Form.Group>
                  </Col>
                  <Col sm={6}>
                     <Form.Group className="mb-3">
                        <Form.Label>Data</Form.Label>
                        <Form.Control 
                           type="date" 
                           required 
                           value={depositFormData.date}
                           onChange={e => setDepositFormData({...depositFormData, date: e.target.value})}
                        />
                     </Form.Group>
                  </Col>
               </Row>

               <Form.Group className="mb-3">
                  <Form.Label>Conta de Origem</Form.Label>
                  <Form.Select 
                     required 
                     value={depositFormData.accountId}
                     onChange={e => setDepositFormData({...depositFormData, accountId: e.target.value})}
                  >
                     {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} - Saldo: {formatCurrency(acc.balance)}</option>
                     ))}
                  </Form.Select>
               </Form.Group>

               <div className="text-center my-3 text-muted">
                  <ArrowRight size={24} />
               </div>

               <Alert variant="info" className="border-0 mb-0 small">
                  O valor depositado será debitado do saldo disponível da conta selecionada e transferido para a meta.
               </Alert>
            </Modal.Body>
            <Modal.Footer>
               <Button variant="light" onClick={() => setShowDepositModal(false)}>Cancelar</Button>
               <Button variant="dark" className="btn-black" type="submit" disabled={depositLoading}>
                  {depositLoading ? 'Processando...' : 'Confirmar Depósito'}
               </Button>
            </Modal.Footer>
         </Form>
      </Modal>
    </>
  )
}

export default Goals
