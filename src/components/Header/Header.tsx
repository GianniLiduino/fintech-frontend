import './Header.css'
import { Button, Container } from 'react-bootstrap';

function Header() {
    return (
        <>
            <header className='w-100 border-1 border-bottom'>
                <Container className='d-flex justify-content-between align-items-center py-2'>
                    <h1>GianniXP</h1>
                    <Button as="a" variant="primary">
                        Sair
                    </Button>
                </Container>
            </header>
        </>
    );
}

export default Header
