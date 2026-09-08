# Requisitos Funcionais — App de Prestação de Serviços (TCC)

| **ID** | **Descrição** | **Ator** |
| --- | --- | --- |
| RF01 | Cadastrar novo usuário (contratante ou contratado)✅ | Ambos |
| RF02 | Autenticar usuário no sistema (login)✅ | Ambos |
| RF03 | ❌Recuperar/redefinir senha | Ambos |
| RF04 | Criar, editar e excluir perfil do usuário | Ambos |
| RF05 | Criar, editar e excluir serviço oferecido | Contratado |
| RF06 | Buscar e filtrar serviços (categoria, localização, preço) | Contratante |
| RF07 | Visualizar detalhes de um serviço/prestador | Ambos |
| RF08 | Solicitar contratação de um serviço | Contratante |
| RF09 | Aceitar ou recusar solicitação de serviço | Contratado |
| RF10 | Acompanhar status da contratação (pendente/aceito/em andamento/concluído/cancelado) | Ambos |
| RF11 | Marcar serviço como concluído | Contratado |
| RF12 | Avaliar e comentar serviço prestado | Ambos |
| RF13 | Visualizar histórico de serviços contratados/prestados | Ambos |
| RF14 | Notificar usuário sobre mudança de status | Sistema |
| RF15 | Exibir lista/dashboard de serviços disponíveis | Sistema |
| RF16 | Calcular e exibir média de avaliação do prestador | Sistema |
| RF17 | Cancelar uma contratação | Ambos |
| RF18 | Denunciar usuário ou serviço | Ambos |
| RF19 | Autenticar administrador com privilégios elevados | Admin |
| RF20 | Gerenciar usuários (bloquear/desbloquear/excluir conta) | Admin |
| RF21 | Analisar e decidir sobre denúncias pendentes | Admin |
| RF22 | Remover serviço ou avaliação em desacordo com as regras | Admin |
| RF23 | Gerenciar categorias de serviços | Admin |

# Requisitos Não Funcionais — App de Prestação de Serviços (TCC)

| **ID** | **Descrição** | **Categoria** |
| --- | --- | --- |
| RNF01 | Firebase responsavel pela autenticação | Segurança |
| RNF02 | Comunicação via HTTPS | Segurança |
| RNF03 | Usuário só acessa/edita seus próprios dados (controle de acesso) | Segurança |
| RNF04 | Controle de acesso por papel (RBAC): Contratante, Contratado e Admin | Segurança |
| RNF05 | Tempo de resposta das requisições principais < 2s | Desempenho |
| RNF06 | Interface responsiva (mobile e desktop) | Usabilidade |
| RNF07 | Disponibilidade do sistema ≥ 99% | Confiabilidade |
| RNF08 | Suportar aumento de usuários sem degradação perceptível | Escalabilidade |
| RNF09 | Código modular e documentado | Manutenibilidade |
| RNF10 | Compatível com os principais navegadores (Chrome, Firefox, Edge) | Portabilidade |
| RNF11 | Tratamento de dados pessoais conforme LGPD | Legal/Conformidade |
| RNF12 | Rotina de backup do banco de dados | Confiabilidade |
| RNF13 | Registro de erros (logs) para diagnóstico | Confiabilidade |