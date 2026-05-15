import { Button, Card, Container } from "react-bootstrap";
import Header from "../../components/Header/Header";
import { ArrowDownRight, ArrowUpRight } from "react-bootstrap-icons";

export default function Home() {
   return (
      <>
         <Header />
         <Container className="d-flex flex-column gap-3">
            <section id="balance" className="d-flex flex-column">
               <small>Saldo Total</small>
               <h2>R$ 13.402,79</h2>
            </section>
            <section id="" className="d-flex w-100 gap-2">
               <Button variant="light" className="w-100 py-4">
                  Adicionar Receita
               </Button>
               <Button variant="light" className="w-100 py-4">
                  Adicionar Despesa
               </Button>
            </section>
            <section id="last-transactions">
               <Card className="hover">
                  <Card.Body>
                     <Card.Text>Transações Recentes</Card.Text>
                     <div className="d-flex flex-column gap-2">
                        <Card>
                           <Card.Body>
                              <Card.Text className="d-flex align-items-center gap-3">
                                 <ArrowDownRight size={32} className="bg-danger-subtle rounded-circle p-2" color="red" />
                                 <p className="mb-0 d-flex flex-column">
                                    <span>Supermercado</span>
                                    <span>Alimentação • 18/10/2023</span>
                                 </p>
                                 <p className="mb-0 text-danger ms-auto">
                                    R$ 233,12
                                 </p>
                              </Card.Text>
                           </Card.Body>
                        </Card>
                        <Card>
                           <Card.Body>
                              <Card.Text className="d-flex align-items-center gap-3">
                                 <ArrowUpRight size={32} className="bg-success-subtle rounded-circle p-2" color="green" />
                                 <p className="mb-0 d-flex flex-column">
                                    <span>Comissão</span>
                                    <span>Trabalho • 18/10/2023</span>
                                 </p>
                                 <p className="mb-0 text-success ms-auto">
                                    R$ 233,12
                                 </p>
                              </Card.Text>
                           </Card.Body>
                        </Card>
                        <Card>
                           <Card.Body>
                              <Card.Text className="d-flex align-items-center gap-3">
                                 <ArrowDownRight size={32} className="bg-danger-subtle rounded-circle p-2" color="red" />
                                 <p className="mb-0 d-flex flex-column">
                                    <span>Supermercado</span>
                                    <span>Alimentação • 18/10/2023</span>
                                 </p>
                                 <p className="mb-0 text-danger ms-auto">
                                    R$ 233,12
                                 </p>
                              </Card.Text>
                           </Card.Body>
                        </Card>
                     </div>
                  </Card.Body>
               </Card>
            </section>
         </Container>
      </>
   );
}