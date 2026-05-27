import { useState, useEffect } from "react"
import { Button, Card, CardBody, CardFooter, CardText, Col, Container, Row, Modal, Form, Alert, Dropdown, Badge, ProgressBar } from "react-bootstrap"
import Header from "../../components/Header/Header"
import { ArrowDownRight, ArrowUpRight, DashCircle, GraphDownArrow, GraphUpArrow, PlusCircle, Wallet2, ListTask, ArrowLeftRight, ThreeDotsVertical, GraphUp, BoxArrowUpRight, Bullseye, Calendar } from "react-bootstrap-icons"
import { Link, useNavigate } from "react-router"

interface Account {
   id: string
   name: string
   balance: number
   investmentBalance?: number
   goalsBalance?: number
}

interface Category {
   id: string
   name: string
   type: string
}

interface Transaction {
   id: string
   name: string
   amount: number
   date: string
   type: 'INCOME' | 'EXPENSE' | 'TRANSFER_IN' | 'TRANSFER_OUT'
   account: { id: string, name: string }
   category: { id: string, name: string }
}

interface InvestmentType {
   key: string
   description: string
   assetClass: string
}

interface Goal {
   id: string
   name: string
   targetAmount: number
   currentAmount: number
   deadline: string
}

interface Investment {
   id: string
   name: string
   amount: number
   date: string
   type: string
   account: { id: string, name: string }
}

const Home = () => {
   const [accounts, setAccounts] = useState<Account[]>([])
   const [categories, setCategories] = useState<Category[]>([])
   const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([])
   const [transactions, setTransactions] = useState<Transaction[]>([])
   const [goals, setGoals] = useState<Goal[]>([])
   const [investments, setInvestments] = useState<Investment[]>([])
   const [totalBalance, setTotalBalance] = useState(0)
   const [totalInvested, setTotalInvested] = useState(0)
   const [totalGoals, setTotalGoals] = useState(0)
   const [totalReceitas, setTotalReceitas] = useState(0)
   const [totalDespesas, setTotalDespesas] = useState(0)
   const navigate = useNavigate()

   // Account Modal State
   const [showAccountModal, setShowAccountModal] = useState(false)
   const [modalLoading, setModalLoading] = useState(false)
   const [accountFormData, setAccountFormData] = useState({ name: '' })
   const [accountError, setAccountError] = useState('')

   // Transaction Modal State
   const [showTxModal, setShowTxModal] = useState(false)
   const [txType, setTxType] = useState<'RECEITA' | 'DESPESA'>('RECEITA')
   const [txModalLoading, setTxModalLoading] = useState(false)
   const [txError, setTxError] = useState('')
   const [txFormData, setTxFormData] = useState({
      name: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      accountId: '',
      categoryId: ''
   })

   // Transfer Modal State
   const [showTransferModal, setShowTransferModal] = useState(false)
   const [transferLoading, setTransferLoading] = useState(false)
   const [transferError, setTransferError] = useState('')
   const [transferFormData, setTransferFormData] = useState({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      originAccountId: '',
      originCategoryId: '',
      destinationAccountId: '',
      destinationCategoryId: ''
   })

   // Investment Modal State
   const [showInvModal, setShowInvModal] = useState(false)
   const [invLoading, setInvLoading] = useState(false)
   const [invError, setInvError] = useState('')
   const [invFormData, setInvFormData] = useState({
      name: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      accountId: '',
      type: ''
   })

   const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
   const token = localStorage.getItem('token')

   const fetchData = async () => {
      try {
         const headers = { 'Authorization': `Bearer ${token}` }

         const [accRes, catRes, txRes, typeRes, goalRes, invRes] = await Promise.all([
            fetch(`${baseUrl}/accounts`, { headers }),
            fetch(`${baseUrl}/categories`, { headers }),
            fetch(`${baseUrl}/transactions`, { headers }),
            fetch(`${baseUrl}/investments/types`, { headers }),
            fetch(`${baseUrl}/goals`, { headers }),
            fetch(`${baseUrl}/investments`, { headers })
         ])

         let currentCats: Category[] = []
         if (catRes.ok) {
            currentCats = await catRes.json()
            setCategories(currentCats)
         }

         if (typeRes.ok) {
            setInvestmentTypes(await typeRes.json())
         }

         if (accRes.ok) {
            const accData: Account[] = await accRes.json()
            setAccounts(accData)
            setTotalBalance(accData.reduce((acc, curr) => acc + curr.balance, 0))
            setTotalInvested(accData.reduce((acc, curr) => acc + (curr.investmentBalance || 0), 0))
            setTotalGoals(accData.reduce((acc, curr) => acc + (curr.goalsBalance || 0), 0))

            if (accData.length > 0 && !txFormData.accountId) {
               setTxFormData(prev => ({ ...prev, accountId: accData[0].id }))
            }
         }

         if (goalRes.ok) {
            setGoals(await goalRes.json())
         }

         if (invRes.ok) {
            setInvestments(await invRes.json())
         }

         if (txRes.ok) {
            const txData: Transaction[] = await txRes.json()
            const sortedTx = txData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            setTransactions(sortedTx)

            let receitas = 0
            let despesas = 0
            txData.forEach(tx => {
               const isReceita = tx.type === 'INCOME' || tx.type === 'TRANSFER_IN'
               if (isReceita) {
                  receitas += Math.abs(tx.amount)
               } else {
                  despesas += Math.abs(tx.amount)
               }
            })
            setTotalReceitas(receitas)
            setTotalDespesas(despesas)
         }

      } catch (error) {
         console.error("Erro ao buscar dados", error)
      }
   }

   useEffect(() => {
      fetchData()
   }, [baseUrl, token])

   const handleCreateAccount = async (e: React.FormEvent) => {
      e.preventDefault()
      setModalLoading(true)
      setAccountError('')

      try {
         const response = await fetch(`${baseUrl}/accounts`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: accountFormData.name })
         })

         if (!response.ok) throw new Error('Erro ao criar conta')

         setShowAccountModal(false)
         setAccountFormData({ name: '' })
         fetchData()
      } catch (err: any) {
         setAccountError(err.message)
      } finally {
         setModalLoading(false)
      }
   }

   const handleOpenTxModal = (type: 'RECEITA' | 'DESPESA') => {
      setTxType(type)
      setTxFormData({
         name: '',
         amount: 0,
         date: new Date().toISOString().split('T')[0],
         accountId: accounts.length > 0 ? accounts[0].id : '',
         categoryId: ''
      })
      setTxError('')
      setShowTxModal(true)
   }

   const handleCreateTx = async (e: React.FormEvent) => {
      e.preventDefault()
      setTxModalLoading(true)
      setTxError('')

      try {
         const payload: any = {
            ...txFormData,
            amount: Math.abs(txFormData.amount),
            type: txType === 'RECEITA' ? 'INCOME' : 'EXPENSE'
         }

         if (!txFormData.categoryId) {
            payload.categoryId = null
         }

         const response = await fetch(`${baseUrl}/transactions`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
         })

         if (!response.ok) throw new Error('Erro ao registrar transação')

         setShowTxModal(false)
         fetchData()
      } catch (err: any) {
         setTxError(err.message)
      } finally {
         setTxModalLoading(false)
      }
   }

   const handleOpenTransferModal = (originAccId: string = '') => {
      setTransferFormData({
         description: '',
         amount: 0,
         date: new Date().toISOString().split('T')[0],
         originAccountId: originAccId || (accounts.length > 0 ? accounts[0].id : ''),
         originCategoryId: '',
         destinationAccountId: '',
         destinationCategoryId: ''
      })
      setTransferError('')
      setShowTransferModal(true)
   }

   const handleCreateTransfer = async (e: React.FormEvent) => {
      e.preventDefault()
      setTransferLoading(true)
      setTransferError('')

      try {
         const payload: any = {
            description: transferFormData.description,
            amount: Math.abs(transferFormData.amount),
            date: transferFormData.date,
            originAccountId: transferFormData.originAccountId
         }

         if (transferFormData.originCategoryId) {
            payload.originCategoryId = transferFormData.originCategoryId
         }

         if (transferFormData.destinationAccountId) {
            payload.destinationAccountId = transferFormData.destinationAccountId
            if (transferFormData.destinationCategoryId) {
               payload.destinationCategoryId = transferFormData.destinationCategoryId
            }
         }

         const response = await fetch(`${baseUrl}/transfers`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
         })

         if (!response.ok) throw new Error('Erro ao registrar transferência')

         setShowTransferModal(false)
         fetchData()
      } catch (err: any) {
         setTransferError(err.message)
      } finally {
         setTransferLoading(false)
      }
   }

   const handleOpenInvModal = (accountId: string) => {
      setInvFormData({
         name: '',
         amount: 0,
         date: new Date().toISOString().split('T')[0],
         accountId: accountId,
         type: investmentTypes.length > 0 ? investmentTypes[0].key : ''
      })
      setInvError('')
      setShowInvModal(true)
   }

   const handleCreateInv = async (e: React.FormEvent) => {
      e.preventDefault()
      setInvLoading(true)
      setInvError('')

      try {
         const payload = {
            ...invFormData,
            amount: Math.abs(invFormData.amount)
         }

         const response = await fetch(`${baseUrl}/investments`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
         })

         if (!response.ok) throw new Error('Erro ao registrar investimento')

         setShowInvModal(false)
         fetchData()
      } catch (err: any) {
         setInvError(err.message)
      } finally {
         setInvLoading(false)
      }
   }

   const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
   }

   const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
      return date.toLocaleDateString('pt-BR')
   }

   return (
      <>
         <Header />
         <Container className="d-flex flex-column gap-4 py-4 pb-5">
            <section id="balance" className="d-flex flex-column mt-2">
               <small className="text-muted fw-medium">Saldo Total</small>
               <h1 className="mb-0 fw-bold">{formatCurrency(totalBalance)}</h1>
               <div className="mt-2 d-flex gap-2">
                  <Badge bg="light" className="text-dark border fw-medium px-3 py-2">
                     Total Investido: {formatCurrency(totalInvested)}
                  </Badge>
                  <Badge bg="light" className="text-dark border fw-medium px-3 py-2">
                     Total em Metas: {formatCurrency(totalGoals)}
                  </Badge>
               </div>
            </section>

            <section id="add-transactions" className="d-flex w-100 gap-2">
               <Button variant="dark" className="btn-black w-100 py-3 d-flex align-items-center justify-content-center gap-2 fw-medium" onClick={() => handleOpenTxModal('RECEITA')}>
                  <PlusCircle size={18} />
                  <p className="mb-0">Nova Transação</p>
               </Button>
            </section>

            <section id="totalizers-transactions">
               <Row className="g-3">
                  <Col md={6}>
                     <Card className="border-0 shadow-sm h-100">
                        <CardBody>
                           <CardText as="div" className="d-flex align-items-center justify-content-between mb-3">
                              <span className="mb-0 text-muted fw-medium">Total de Receitas</span>
                              <GraphUpArrow size={20} color="green" />
                           </CardText>
                           <CardText as="div" className="d-flex align-items-center justify-content-between">
                              <h5 className="mb-0 text-success fw-bold">{formatCurrency(totalReceitas)}</h5>
                           </CardText>
                        </CardBody>
                        <CardFooter className="bg-white border-0 pt-0">
                           <small className="text-muted">Análise de receitas</small>
                        </CardFooter>
                     </Card>
                  </Col>
                  <Col md={6}>
                     <Card className="border-0 shadow-sm h-100">
                        <CardBody>
                           <CardText as="div" className="d-flex align-items-center justify-content-between mb-3">
                              <span className="mb-0 text-muted fw-medium">Total de Despesas</span>
                              <GraphDownArrow size={20} color="red" />
                           </CardText>
                           <CardText as="div" className="d-flex align-items-center justify-content-between">
                              <h5 className="mb-0 text-danger fw-bold">{formatCurrency(totalDespesas)}</h5>
                           </CardText>
                        </CardBody>
                        <CardFooter className="bg-white border-0 pt-0">
                           <small className="text-muted">Análise de despesas</small>
                        </CardFooter>
                     </Card>
                  </Col>
               </Row>
            </section>

            <section id="accounts-list">
               <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0 fw-bold text-muted small text-uppercase">Minhas Contas</h5>
                  <Button variant="link" className="p-0 text-dark text-decoration-none small fw-medium d-flex align-items-center gap-1" onClick={() => setShowAccountModal(true)}>
                     <PlusCircle size={14} /> Nova Conta
                  </Button>
               </div>
               <Row className="g-3">
                  {accounts.length === 0 ? (
                     <Col xs={12}>
                        <p className="text-muted small">Nenhuma conta encontrada.</p>
                     </Col>
                  ) : (
                     accounts.map(acc => (
                        <Col md={6} lg={4} key={acc.id}>
                           <Card className="border-0 shadow-sm h-100">
                              <CardBody>
                                 <CardText as="div" className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                       <Wallet2 size={20} className="text-dark" />
                                       <span className="mb-0 text-muted fw-medium">{acc.name}</span>
                                    </div>
                                    <Dropdown align="end">
                                       <Dropdown.Toggle variant="link" className="text-dark p-0 border-0 shadow-none no-caret">
                                          <ThreeDotsVertical size={20} />
                                       </Dropdown.Toggle>
                                       <Dropdown.Menu className="shadow border-0">
                                          <Dropdown.Item className="d-flex align-items-center gap-2 py-2" onClick={() => handleOpenTransferModal(acc.id)}>
                                             <ArrowLeftRight size={16} /> Transferir
                                          </Dropdown.Item>
                                          <Dropdown.Item className="d-flex align-items-center gap-2 py-2" onClick={() => handleOpenInvModal(acc.id)}>
                                             <GraphUp size={16} /> Investir
                                          </Dropdown.Item>
                                       </Dropdown.Menu>
                                    </Dropdown>
                                 </CardText>
                                 <CardText as="div" className="d-flex align-items-center justify-content-between">
                                    <h5 className="mb-0 fw-bold">{formatCurrency(acc.balance)}</h5>
                                 </CardText>
                              </CardBody>
                              <CardFooter className="bg-white border-0 pt-0">
                                 <small className="text-muted small">Saldo disponível</small>
                              </CardFooter>
                           </Card>
                        </Col>
                     ))
                  )}
               </Row>
            </section>

            <Row className="g-4">
               <Col lg={6}>
                  <section id="home-goals">
                     <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0 fw-bold text-muted small text-uppercase">Minhas Metas</h5>
                        <Button as={Link} to="/goals" variant="link" className="text-decoration-none text-dark p-0">
                           <BoxArrowUpRight size={18} />
                        </Button>
                     </div>
                     <div className="d-flex flex-column gap-3">
                        {goals.length === 0 ? (
                           <Card className="border-0 shadow-sm">
                              <CardBody className="text-center py-4">
                                 <p className="text-muted small mb-0">Nenhuma meta cadastrada.</p>
                              </CardBody>
                           </Card>
                        ) : (
                           goals.slice(0, 3).map(goal => {
                              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                              return (
                                 <Card key={goal.id} className="border-0 shadow-sm">
                                    <CardBody className="p-3">
                                       <div className="d-flex align-items-center gap-3 mb-2">
                                          <Bullseye size={32} className="bg-dark text-white rounded-circle p-2 flex-shrink-0" />
                                          <div className="d-flex flex-column overflow-hidden flex-grow-1">
                                             <span className="fw-bold text-truncate">{goal.name}</span>
                                             <span className="text-muted small text-truncate">
                                                Meta: {formatCurrency(goal.targetAmount)}
                                             </span>
                                          </div>
                                          <span className="fw-bold small">{progress.toFixed(0)}%</span>
                                       </div>
                                       <ProgressBar variant={progress === 100 ? 'success' : 'dark'} now={progress} style={{ height: '6px' }} className="rounded-pill" />
                                    </CardBody>
                                 </Card>
                              )
                           })
                        )}
                     </div>
                  </section>
               </Col>

               <Col lg={6}>
                  <section id="home-investments">
                     <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0 fw-bold text-muted small text-uppercase">Meus Investimentos</h5>
                        <Button as={Link} to="/investments" variant="link" className="text-decoration-none text-dark p-0">
                           <BoxArrowUpRight size={18} />
                        </Button>
                     </div>
                     <div className="d-flex flex-column gap-3">
                        {investments.length === 0 ? (
                           <Card className="border-0 shadow-sm">
                              <CardBody className="text-center py-4">
                                 <p className="text-muted small mb-0">Nenhum investimento registrado.</p>
                              </CardBody>
                           </Card>
                        ) : (
                           investments.slice(0, 3).map(inv => (
                              <Card key={inv.id} className="border-0 shadow-sm">
                                 <CardBody className="p-3">
                                    <div className="d-flex align-items-center gap-3">
                                       <GraphUp size={32} className="bg-dark text-white rounded-circle p-2 flex-shrink-0" />
                                       <div className="d-flex flex-column overflow-hidden flex-grow-1">
                                          <span className="fw-bold text-truncate">{inv.name}</span>
                                          <span className="text-muted small text-truncate">
                                             {inv.type} • {inv.account?.name || 'Conta'}
                                          </span>
                                       </div>
                                       <span className="fw-bold text-dark">{formatCurrency(inv.amount)}</span>
                                    </div>
                                 </CardBody>
                              </Card>
                           ))
                        )}
                     </div>
                  </section>
               </Col>
            </Row>

            <section id="last-transactions">
               <Card className="border-0 shadow-sm">
                  <CardBody>
                     <CardText as="div" className="d-flex align-items-center justify-content-between mb-4">
                        <div className="d-flex align-items-center">
                           <ListTask size={20} className="text-muted me-2" />
                           <span className="mb-0 text-muted fw-medium">Transações Recentes</span>
                        </div>
                        <Button as={Link} to="/transactions" variant="link" className="text-decoration-none text-dark p-0">
                           <BoxArrowUpRight size={18} />
                        </Button>
                     </CardText>
                     <div className="d-flex flex-column gap-3">
                        {transactions.length === 0 ? (
                           <p className="text-muted small text-center mb-0 py-3">Nenhuma transação encontrada.</p>
                        ) : (
                           transactions.slice(0, 5).map(tx => {
                              const isReceita = tx.type === 'INCOME' || tx.type === 'TRANSFER_IN'
                              return (
                                 <div key={tx.id} className="d-flex align-items-center gap-3">
                                    {isReceita ? (
                                       <ArrowUpRight size={36} className="bg-success-subtle rounded-circle p-2 text-success flex-shrink-0" />
                                    ) : (
                                       <ArrowDownRight size={36} className="bg-danger-subtle rounded-circle p-2 text-danger flex-shrink-0" />
                                    )}
                                    <div className="d-flex flex-column overflow-hidden">
                                       <span className="fw-bold text-truncate">{tx.name}</span>
                                       <span className="text-muted small text-truncate">
                                          {tx.category?.name || 'Sem categoria'} • {tx.account?.name || 'Conta desconhecida'} • {formatDate(tx.date)}
                                       </span>
                                    </div>
                                    <span className={`mb-0 ms-auto fw-bold flex-shrink-0 ${isReceita ? 'text-success' : 'text-danger'}`}>
                                       {isReceita ? '+' : '-'} {formatCurrency(Math.abs(tx.amount))}
                                    </span>
                                 </div>
                              )
                           })
                        )}
                     </div>
                  </CardBody>
               </Card>
            </section>
         </Container>

         {/* Account Modal */}
         <Modal show={showAccountModal} onHide={() => setShowAccountModal(false)} centered>
            <Form onSubmit={handleCreateAccount}>
               <Modal.Header closeButton>
                  <Modal.Title className="fw-bold">Nova Conta</Modal.Title>
               </Modal.Header>
               <Modal.Body>
                  {accountError && <Alert variant="danger">{accountError}</Alert>}
                  <Form.Group className="mb-3" controlId="accountName">
                     <Form.Label>Nome da Conta</Form.Label>
                     <Form.Control
                        type="text"
                        placeholder="Ex: Carteira, Banco Inter..."
                        value={accountFormData.name}
                        onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })}
                        required
                     />
                  </Form.Group>
               </Modal.Body>
               <Modal.Footer>
                  <Button variant="light" onClick={() => setShowAccountModal(false)}>Cancelar</Button>
                  <Button variant="dark" className="btn-black" type="submit" disabled={modalLoading}>
                     {modalLoading ? 'Criando...' : 'Criar Conta'}
                  </Button>
               </Modal.Footer>
            </Form>
         </Modal>

         {/* Transaction Modal */}
         <Modal show={showTxModal} onHide={() => setShowTxModal(false)} centered>
            <Form onSubmit={handleCreateTx}>
               <Modal.Header closeButton>
                  <Modal.Title className="fw-bold">Nova Transação</Modal.Title>
               </Modal.Header>
               <Modal.Body>
                  {txError && <Alert variant="danger">{txError}</Alert>}

                  <Form.Group className="mb-4">
                     <Form.Label className="small fw-bold text-muted text-uppercase">Tipo de Transação</Form.Label>
                     <div className="d-flex gap-2">
                        <Button 
                           variant={txType === 'RECEITA' ? 'success' : 'outline-success'} 
                           className="w-100 fw-bold py-2"
                           onClick={() => setTxType('RECEITA')}
                        >
                           Receita
                        </Button>
                        <Button 
                           variant={txType === 'DESPESA' ? 'danger' : 'outline-danger'} 
                           className="w-100 fw-bold py-2"
                           onClick={() => setTxType('DESPESA')}
                        >
                           Despesa
                        </Button>
                     </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-3" controlId="txName">
                     <Form.Label>Descrição</Form.Label>
                     <Form.Control
                        type="text"
                        placeholder="Ex: Aluguel, Salário, Supermercado..."
                        value={txFormData.name}
                        onChange={(e) => setTxFormData({ ...txFormData, name: e.target.value })}
                        required
                     />
                  </Form.Group>

                  <Row>
                     <Col sm={6}>
                        <Form.Group className="mb-3" controlId="txAmount">
                           <Form.Label>Valor (R$)</Form.Label>
                           <Form.Control
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={txFormData.amount}
                              onChange={(e) => setTxFormData({ ...txFormData, amount: parseFloat(e.target.value) })}
                              required
                           />
                        </Form.Group>
                     </Col>
                     <Col sm={6}>
                        <Form.Group className="mb-3" controlId="txDate">
                           <Form.Label>Data</Form.Label>
                           <Form.Control
                              type="date"
                              value={txFormData.date}
                              onChange={(e) => setTxFormData({ ...txFormData, date: e.target.value })}
                              required
                           />
                        </Form.Group>
                     </Col>
                  </Row>

                  <Form.Group className="mb-3" controlId="txAccount">
                     <Form.Label>Conta</Form.Label>
                     <Form.Select
                        value={txFormData.accountId}
                        onChange={(e) => setTxFormData({ ...txFormData, accountId: e.target.value })}
                        required
                     >
                        <option value="" disabled>Selecione uma conta</option>
                        {accounts.map(acc => (
                           <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                     </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="txCategory">
                     <Form.Label>Categoria (Opcional)</Form.Label>
                     <Form.Select
                        value={txFormData.categoryId}
                        onChange={(e) => setTxFormData({ ...txFormData, categoryId: e.target.value })}
                     >
                        <option value="">Nenhuma categoria</option>
                        {categories
                           .filter(cat => cat.type === txType)
                           .map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                           ))
                        }
                     </Form.Select>
                  </Form.Group>
               </Modal.Body>
               <Modal.Footer>
                  <Button variant="light" onClick={() => setShowTxModal(false)}>Cancelar</Button>
                  <Button
                     variant={txType === 'RECEITA' ? 'success' : 'danger'}
                     className={txType === 'RECEITA' ? 'bg-success border-0' : 'bg-danger border-0'}
                     type="submit"
                     disabled={txModalLoading}
                  >
                     {txModalLoading ? 'Salvando...' : 'Confirmar'}
                  </Button>
               </Modal.Footer>
            </Form>
         </Modal>

         {/* Transfer Modal */}
         <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)} centered size="lg">
            <Form onSubmit={handleCreateTransfer}>
               <Modal.Header closeButton>
                  <Modal.Title className="fw-bold">Nova Transferência</Modal.Title>
               </Modal.Header>
               <Modal.Body>
                  {transferError && <Alert variant="danger">{transferError}</Alert>}

                  <Row>
                     <Col md={12}>
                        <Form.Group className="mb-3">
                           <Form.Label>Descrição</Form.Label>
                           <Form.Control
                              type="text"
                              placeholder="Ex: Ajuste de saldo, Pagamento aluguel..."
                              value={transferFormData.description}
                              onChange={e => setTransferFormData({...transferFormData, description: e.target.value})}
                              required
                           />
                        </Form.Group>
                     </Col>
                  </Row>

                  <Row>
                     <Col md={6}>
                        <Form.Group className="mb-3">
                           <Form.Label>Valor (R$)</Form.Label>
                           <Form.Control
                              type="number"
                              step="0.01"
                              value={transferFormData.amount}
                              onChange={e => setTransferFormData({...transferFormData, amount: parseFloat(e.target.value)})}
                              required
                           />
                        </Form.Group>
                     </Col>
                     <Col md={6}>
                        <Form.Group className="mb-3">
                           <Form.Label>Data</Form.Label>
                           <Form.Control
                              type="date"
                              value={transferFormData.date}
                              onChange={e => setTransferFormData({...transferFormData, date: e.target.value})}
                              required
                           />
                        </Form.Group>
                     </Col>
                  </Row>

                  <hr className="my-4" />

                  <Row>
                     <Col md={6}>
                        <h6 className="fw-bold mb-3">Origem (Saída)</h6>
                        <Form.Group className="mb-3">
                           <Form.Label>Conta de Origem</Form.Label>
                           <Form.Select
                              value={transferFormData.originAccountId}
                              onChange={e => setTransferFormData({...transferFormData, originAccountId: e.target.value})}
                              required
                           >
                              <option value="" disabled>Selecione</option>
                              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                           </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                           <Form.Label>Categoria de Saída (Opcional)</Form.Label>
                           <Form.Select
                              value={transferFormData.originCategoryId}
                              onChange={e => setTransferFormData({...transferFormData, originCategoryId: e.target.value})}
                           >
                              <option value="">Selecione</option>
                              {categories.filter(c => c.type === 'DESPESA').map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                           </Form.Select>
                        </Form.Group>
                     </Col>

                     <Col md={6}>
                        <h6 className="fw-bold mb-3 text-muted">Destino (Opcional - Para Interna)</h6>
                        <Form.Group className="mb-3">
                           <Form.Label>Conta de Destino</Form.Label>
                           <Form.Select
                              value={transferFormData.destinationAccountId}
                              onChange={e => setTransferFormData({...transferFormData, destinationAccountId: e.target.value})}
                           >
                              <option value="">Transferência Externa (Terceiros)</option>
                              {accounts.filter(a => a.id !== transferFormData.originAccountId).map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                           </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                           <Form.Label>Categoria de Entrada (Opcional)</Form.Label>
                           <Form.Select
                              value={transferFormData.destinationCategoryId}
                              onChange={e => setTransferFormData({...transferFormData, destinationCategoryId: e.target.value})}
                           >
                              <option value="">Selecione</option>
                              {categories.filter(c => c.type === 'RECEITA').map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                           </Form.Select>
                        </Form.Group>
                     </Col>
                  </Row>

               </Modal.Body>
               <Modal.Footer>
                  <Button variant="light" onClick={() => setShowTransferModal(false)}>Cancelar</Button>
                  <Button variant="dark" className="btn-black px-4" type="submit" disabled={transferLoading}>
                     {transferLoading ? 'Processando...' : 'Confirmar'}
                  </Button>
               </Modal.Footer>
            </Form>
         </Modal>

         {/* Investment Modal */}
         <Modal show={showInvModal} onHide={() => setShowInvModal(false)} centered>
            <Form onSubmit={handleCreateInv}>
               <Modal.Header closeButton>
                  <Modal.Title className="fw-bold">Novo Investimento</Modal.Title>
               </Modal.Header>
               <Modal.Body>
                  {invError && <Alert variant="danger">{invError}</Alert>}
                  
                  <Form.Group className="mb-3" controlId="invName">
                     <Form.Label>Descrição do Investimento</Form.Label>
                     <Form.Control
                        type="text"
                        placeholder="Ex: CDB Banco X, Tesouro Direto..."
                        value={invFormData.name}
                        onChange={(e) => setInvFormData({ ...invFormData, name: e.target.value })}
                        required
                     />
                  </Form.Group>

                  <Row>
                     <Col sm={6}>
                        <Form.Group className="mb-3" controlId="invAmount">
                           <Form.Label>Valor (R$)</Form.Label>
                           <Form.Control
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={invFormData.amount}
                              onChange={(e) => setInvFormData({ ...invFormData, amount: parseFloat(e.target.value) })}
                              required
                           />
                        </Form.Group>
                     </Col>
                     <Col sm={6}>
                        <Form.Group className="mb-3" controlId="invDate">
                           <Form.Label>Data</Form.Label>
                           <Form.Control
                              type="date"
                              value={invFormData.date}
                              onChange={(e) => setInvFormData({ ...invFormData, date: e.target.value })}
                              required
                           />
                        </Form.Group>
                     </Col>
                  </Row>

                  <Form.Group className="mb-3" controlId="invAccount">
                     <Form.Label>Debitar da Conta</Form.Label>
                     <Form.Select
                        value={invFormData.accountId}
                        onChange={(e) => setInvFormData({ ...invFormData, accountId: e.target.value })}
                        required
                     >
                        <option value="" disabled>Selecione uma conta</option>
                        {accounts.map(acc => (
                           <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                     </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="invType">
                     <Form.Label>Tipo de Investimento</Form.Label>
                     <Form.Select
                        value={invFormData.type}
                        onChange={(e) => setInvFormData({ ...invFormData, type: e.target.value })}
                        required
                     >
                        <option value="" disabled>Selecione um tipo</option>
                        {investmentTypes.map(type => (
                           <option key={type.key} value={type.key}>{type.description}</option>
                        ))}
                     </Form.Select>
                  </Form.Group>
               </Modal.Body>
               <Modal.Footer>
                  <Button variant="light" onClick={() => setShowInvModal(false)}>Cancelar</Button>
                  <Button variant="dark" className="btn-black" type="submit" disabled={invLoading}>
                     {invLoading ? 'Confirmar' : 'Confirmar Investimento'}
                  </Button>
               </Modal.Footer>
            </Form>
         </Modal>
      </>
   )
}

export default Home
