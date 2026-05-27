import { useState, useEffect } from 'react'
import { Container, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap'
import { PlusCircle, PencilSquare, Trash } from 'react-bootstrap-icons'
import Header from '../../components/Header/Header'

interface Category {
  id: string
  name: string
  type: string
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', type: 'DESPESA' })

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
  const token = localStorage.getItem('token')

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Erro ao buscar categorias')
      const data = await response.json()
      setCategories(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenModal = (category: Category | null = null) => {
    if (category) {
      setCurrentCategory(category)
      setFormData({ name: category.name, type: category.type })
    } else {
      setCurrentCategory(null)
      setFormData({ name: '', type: 'DESPESA' })
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

    const method = currentCategory ? 'PUT' : 'POST'
    const url = currentCategory
      ? `${baseUrl}/categories/${currentCategory.id}`
      : `${baseUrl}/categories`

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Erro ao salvar categoria')

      handleCloseModal()
      fetchCategories()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      const response = await fetch(`${baseUrl}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Erro ao excluir categoria')
      fetchCategories()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <>
      <Header />
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Categorias</h2>
          <Button variant="dark" className="btn-black d-flex align-items-center gap-2" onClick={() => handleOpenModal()}>
            <PlusCircle /> Nova Categoria
          </Button>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <Table responsive hover className="bg-white rounded shadow-sm">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-muted">Nenhuma categoria encontrada</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="align-middle">{cat.name}</td>
                    <td className="align-middle">
                      <span className={`badge ${cat.type === 'RECEITA' ? 'bg-success' : 'bg-danger'}`}>
                        {cat.type}
                      </span>
                    </td>
                    <td className="text-end">
                      <Button variant="light" size="sm" className="me-2" onClick={() => handleOpenModal(cat)}>
                        <PencilSquare />
                      </Button>
                      <Button variant="light" size="sm" className="text-danger" onClick={() => handleDelete(cat.id)}>
                        <Trash />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Container>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{currentCategory ? 'Editar Categoria' : 'Nova Categoria'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="categoryName">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: Alimentação, Salário..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="categoryType">
              <Form.Label>Tipo</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="DESPESA">DESPESA</option>
                <option value="RECEITA">RECEITA</option>
              </Form.Select>
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

export default Categories
