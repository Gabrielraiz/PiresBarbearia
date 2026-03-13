# Organização do Projeto

## 1. Fluxo Público (Cliente)

1. Início: `client/src/pages/Home.jsx`
2. Serviços: `client/src/pages/Services.jsx`
3. Agendamento: `client/src/pages/Booking.jsx`
4. Equipe: `client/src/pages/Team.jsx`
5. Galeria: `client/src/pages/Gallery.jsx`
6. Contato: `client/src/pages/Contact.jsx`
7. Login: `client/src/pages/Login.jsx`
8. Cadastro: `client/src/pages/Register.jsx`
9. Perfil: `client/src/pages/Profile.jsx`
10. Meus Agendamentos: `client/src/pages/MyAppointments.jsx`

## 2. Módulos Públicos Independentes

1. Sobre: `client/src/pages/modules/AboutModulePage.jsx`
2. Blog (lista): `client/src/pages/modules/BlogModulePage.jsx`
3. Blog (detalhe): `client/src/pages/modules/BlogPostModulePage.jsx`
4. FAQ: `client/src/pages/modules/FaqModulePage.jsx`
5. Privacidade: `client/src/pages/modules/PrivacyModulePage.jsx`
6. Termos: `client/src/pages/modules/TermsModulePage.jsx`
7. Carrinho: `client/src/pages/modules/CartModulePage.jsx`
8. Checkout: `client/src/pages/modules/CheckoutModulePage.jsx`
9. Parceiros: `client/src/pages/modules/PartnersModulePage.jsx`
10. Newsletter: `client/src/pages/modules/NewsletterModulePage.jsx`
11. Eventos: `client/src/pages/modules/EventsModulePage.jsx`
12. Ingressos: `client/src/pages/modules/TicketsModulePage.jsx`
13. Delivery: `client/src/pages/modules/DeliveryModulePage.jsx`
14. Suporte: `client/src/pages/modules/SupportModulePage.jsx`
15. Evento (detalhe): `client/src/pages/modules/EventItemPage.jsx`
16. Ingresso (detalhe): `client/src/pages/modules/TicketItemPage.jsx`
17. Delivery (detalhe): `client/src/pages/modules/DeliveryItemPage.jsx`
18. Suporte (detalhe): `client/src/pages/modules/SupportItemPage.jsx`
19. Parceiro (detalhe): `client/src/pages/modules/PartnerItemPage.jsx`
20. Newsletter (detalhe): `client/src/pages/modules/NewsletterItemPage.jsx`

## 2.1 Features por domínio (Frontend)

1. Blog: `client/src/features/blog/useBlogPosts.js`
2. FAQ: `client/src/features/faq/useFaqItems.js`
3. Páginas estáticas: `client/src/features/pages/useContentPage.js`
4. Eventos: `client/src/features/events/useEventsEntries.js`
5. Ingressos: `client/src/features/tickets/useTicketEntries.js`
6. Delivery: `client/src/features/delivery/useDeliveryZones.js`
7. Suporte: `client/src/features/support/useSupportChannels.js`
8. Parceiros: `client/src/features/partners/usePartnerEntries.js`
9. Newsletter: `client/src/features/newsletter/useNewsletterEntries.js`

## 3. Fluxo Admin

1. Login Admin: `client/src/pages/admin/AdminLogin.jsx`
2. Setup Admin: `client/src/pages/admin/SetupAdmin.jsx`
3. Dashboard: `client/src/pages/admin/Dashboard.jsx`
4. Agenda: `client/src/pages/admin/Schedule.jsx`
5. Clientes: `client/src/pages/admin/Clients.jsx`
6. Profissionais: `client/src/pages/admin/Barbers.jsx`
7. Serviços: `client/src/pages/admin/Services.jsx`
8. Galeria: `client/src/pages/admin/Media.jsx`
9. Relatórios: `client/src/pages/admin/Reports.jsx`
10. Bloqueios: `client/src/pages/admin/Blockouts.jsx`
11. Configurações: `client/src/pages/admin/Settings.jsx`
12. Conteúdo Blog: `client/src/pages/admin/BlogContent.jsx`
13. Conteúdo FAQ: `client/src/pages/admin/FaqContent.jsx`
14. Conteúdo Eventos: `client/src/pages/admin/EventsContent.jsx`
15. Conteúdo Ingressos: `client/src/pages/admin/TicketsContent.jsx`
16. Conteúdo Delivery: `client/src/pages/admin/DeliveryContent.jsx`
17. Conteúdo Suporte: `client/src/pages/admin/SupportContent.jsx`
18. Conteúdo Parceiros: `client/src/pages/admin/PartnersContent.jsx`
19. Conteúdo Newsletter: `client/src/pages/admin/NewsletterContent.jsx`
20. CRUD genérico de domínio: `client/src/pages/admin/content/DomainCrudPage.jsx`

## 4. Backend de Domínio

1. Servidor HTTP: `server/server.js`
2. Banco e seed: `server/database.js`
3. Regras de agenda: `server/scheduling.js`
4. Rotas de agendamento: `server/routes/appointments.js`
5. Rotas de profissionais e slots: `server/routes/barbers.js`
6. Rotas de módulos genéricos: `server/routes/modules.js`
7. Rotas de Blog por domínio: `server/routes/content/blog.js`
8. Rotas de FAQ por domínio: `server/routes/content/faq.js`
9. Rotas de Eventos por domínio: `server/routes/content/events.js`
10. Rotas de Ingressos por domínio: `server/routes/content/tickets.js`
11. Rotas de Delivery por domínio: `server/routes/content/delivery.js`
12. Rotas de Suporte por domínio: `server/routes/content/support.js`
13. Rotas de Parceiros por domínio: `server/routes/content/partners.js`
14. Rotas de Newsletter por domínio: `server/routes/content/newsletter.js`
15. Rotas de Páginas estáticas: `server/routes/content/pages.js`
16. Rotas de configurações: `server/routes/settings.js`

## 5. Contratos de Roteamento

- Rotas públicas e admin: `client/src/App.jsx`
- Layout cliente: `client/src/components/Sidebar.jsx` + `client/src/components/Footer.jsx`
- Layout admin: `client/src/components/AdminLayout.jsx`
