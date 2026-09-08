# Classes - Banco de Dados

Usuario

| Campo | Tipo | Chave |
| --- | --- | --- |
| id | uuid | PK |
| nome | string |  |
| email | string | UK |
| senha_hash | string |  |
| papel | string |  |
| bloqueado | boolean |  |
| bloqueado_em | timestamp |  |
| criado_em | timestamp |  |

Perfil

| Campo | Tipo | Chave |
| --- | --- | --- |
| id | uuid | PK |
| usuario_id | uuid | FK |
| bio | text |  |
| foto_url | string |  |
| telefone | string |  |
| localizacao | string |  |

Categoria

| Campo | Tipo | Chave |
| --- | --- | --- |
| id | uuid | PK |
| nome | string |  |

Servico

| Campo | Tipo | Chave |
| --- | --- | --- |
| id | uuid | PK |
| contratado_id | uuid | FK |
| categoria_id | uuid | FK |
| titulo | string |  |
| descricao | text |  |
| preco | decimal |  |
| criado_em | timestamp |  |

Contratacao

| Campo | Tipo | Chave |
| --- | --- | --- |
| id | uuid | PK |
| servico_id | uuid | FK |
| contratante_id | uuid | FK |
| status | string |  |
| criado_em | timestamp |  |
| concluido_em | timestamp |  |

Avaliacao

| Campo | Tipo | Chave |
| --- | --- | --- |
| id | uuid | PK |
| contratacao_id | uuid | FK |
| autor_id | uuid | FK |
| nota | int |  |
| comentario | text |  |
| criado_em | timestamp |  |

Denuncia

| Campo | Tipo | Chave |
| --- | --- | --- |
| id | uuid | PK |
| denunciante_id | uuid | FK |
| alvo_tipo | string |  |
| alvo_id | uuid |  |
| motivo | string |  |
| status | string |  |
| criado_em | timestamp |  |

Notificacao

| Campo | Tipo | Chave |
| --- | --- | --- |
| id | uuid | PK |
| usuario_id | uuid | FK |
| mensagem | string |  |
| lida | boolean |  |
| criado_em | timestamp |  |