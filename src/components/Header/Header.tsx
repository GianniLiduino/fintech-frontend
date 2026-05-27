import { BoxArrowRight, List, Wallet2, House, Tags, CreditCard, GraphUp, ListTask, Bullseye } from 'react-bootstrap-icons'
import './Header.css'
import { Button, Container, Offcanvas, OffcanvasHeader, Nav, ListGroup } from 'react-bootstrap'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router'

const Header = () => {
    const [show, setShow] = useState(false)
    const navigate = useNavigate()

    const handleShow = () => setShow(true)
    const handleClose = () => setShow(false)

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <>
            <header className='w-100 border-1 border-bottom bg-white'>
                <Container className='d-flex justify-content-between align-items-center py-3'>
                    <Button variant='light' onClick={handleShow}>
                        <List size={24} />
                    </Button>
                    <div className='d-flex align-items-center'>
                        <Wallet2 size={36} className='bg-dark text-white p-2 rounded-2 me-2' />
                        <h3 className="mb-0">
                            GianniXP
                        </h3>
                    </div>
                    <Button
                        onClick={handleLogout}
                        className='py-1 px-3 fw-medium d-flex align-items-center justify-content-between' variant="light">
                        <BoxArrowRight size={20} className='me-2' />
                        <p className='mb-0'>Sair</p>
                    </Button>
                </Container>
            </header>

            <Offcanvas show={show} onHide={handleClose}>
                <OffcanvasHeader closeButton={true} className="border-bottom py-4">
                    <div className='d-flex align-items-center'>
                        <Wallet2 size={32} className='bg-dark text-white p-2 rounded-2 me-2' />
                        <h5 className="mb-0 fw-bold">Menu GianniXP</h5>
                    </div>
                </OffcanvasHeader>
                <Offcanvas.Body className="p-0">
                    <ListGroup variant="flush">
                        <ListGroup.Item action as={Link} to="/" onClick={handleClose} className="d-flex align-items-center py-3 px-4 border-0 fw-medium text-dark">
                            <House size={22} className="me-3" />
                            Home
                        </ListGroup.Item>
                        <ListGroup.Item action as={Link} to="/accounts" onClick={handleClose} className="d-flex align-items-center py-3 px-4 border-0 fw-medium text-dark">
                            <CreditCard size={22} className="me-3" />
                            Contas
                        </ListGroup.Item>
                        <ListGroup.Item action as={Link} to="/transactions" onClick={handleClose} className="d-flex align-items-center py-3 px-4 border-0 fw-medium text-dark">
                            <ListTask size={22} className="me-3" />
                            Transações
                        </ListGroup.Item>
                        <ListGroup.Item action as={Link} to="/categories" onClick={handleClose} className="d-flex align-items-center py-3 px-4 border-0 fw-medium text-dark">
                            <Tags size={22} className="me-3" />
                            Categorias
                        </ListGroup.Item>
                        <ListGroup.Item action as={Link} to="/investments" onClick={handleClose} className="d-flex align-items-center py-3 px-4 border-0 fw-medium text-dark">
                            <GraphUp size={22} className="me-3" />
                            Investimentos
                        </ListGroup.Item>
                        <ListGroup.Item action as={Link} to="/goals" onClick={handleClose} className="d-flex align-items-center py-3 px-4 border-0 fw-medium text-dark">
                            <Bullseye size={22} className="me-3" />
                            Metas
                        </ListGroup.Item>
                    </ListGroup>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default Header
