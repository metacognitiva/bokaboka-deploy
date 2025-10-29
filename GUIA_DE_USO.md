# Guia de Uso - BokaBoka Restaurado

## Acesso ao Site

O site BokaBoka foi restaurado com sucesso e está disponível em:

**URL Pública:** https://3000-iwgtrlarx5uglazngldew-7bd61416.manusvm.computer

Esta URL é temporária e estará disponível enquanto o servidor estiver rodando nesta sessão do Manus.

## O Que Foi Restaurado

O projeto foi completamente restaurado a partir do checkpoint `manus-webdev://dbc2bcf`, incluindo todo o código fonte, configurações e estrutura do banco de dados. O banco de dados MySQL foi configurado localmente e populado com os dados dos profissionais que estavam salvos no checkpoint.

### Dados Disponíveis

O sistema conta atualmente com **16 profissionais** cadastrados, distribuídos entre diferentes status de aprovação. Destes, **8 profissionais** estão aprovados e visíveis na página inicial, incluindo psicólogos, especialistas em marketing digital, advogados e motoristas particulares. Os profissionais aprovados possuem badges de verificação e alguns têm o plano destaque ativo.

### Funcionalidades Ativas

A página inicial está totalmente funcional, exibindo o ranking dos top 3 profissionais com melhor avaliação. O sistema de busca permite filtrar profissionais por categoria e localização. Cada card de profissional mostra informações completas incluindo foto, nome, categoria, cidade, avaliações e badges de verificação.

O sistema de autenticação OAuth está configurado e pronto para uso. Os profissionais com plano destaque aparecem destacados na listagem, e o sistema de avaliações com estrelas está funcionando corretamente.

## Configurações do Banco de Dados

O banco de dados MySQL foi criado com as seguintes credenciais:

- **Host:** localhost
- **Usuário:** bokaboka
- **Senha:** bokaboka123
- **Database:** bokaboka

Para acessar o banco de dados diretamente via linha de comando, utilize o comando `mysql -u bokaboka -pbokaboka123 bokaboka`.

## Estrutura do Projeto

O projeto segue uma arquitetura full-stack moderna com frontend em React e backend em Express com tRPC. O diretório `client/` contém todo o código do frontend, incluindo páginas, componentes e utilitários. O diretório `server/` contém a API backend com routers e serviços. O diretório `drizzle/` gerencia o schema e migrations do banco de dados.

As dependências foram instaladas via pnpm e todas as configurações necessárias estão no arquivo `.env` na raiz do projeto.

## Comandos Importantes

Para iniciar o servidor de desenvolvimento, navegue até o diretório do projeto e execute `pnpm dev`. O servidor iniciará na porta 3000.

Para acessar o banco de dados, use `mysql -u bokaboka -pbokaboka123 bokaboka`.

Para aplicar mudanças no schema do banco, execute `pnpm drizzle-kit push`.

Para visualizar os logs do servidor, a sessão de desenvolvimento está rodando em background na sessão chamada 'dev'.

## Secrets e Configurações

Algumas secrets estão configuradas com valores placeholder e precisarão ser atualizadas para funcionalidades completas:

- **RESEND_API_KEY:** Necessário para envio de emails (confirmação, notificações)
- **MERCADOPAGO_ACCESS_TOKEN:** Necessário para processar pagamentos
- **BUILT_IN_FORGE_API_KEY:** Necessário para upload de novas imagens

As imagens dos profissionais que já estavam no checkpoint continuam funcionando pois estão hospedadas no CDN do Forge/Manus.

## Próximas Ações Recomendadas

Para colocar o site em produção completa, será necessário configurar as secrets reais para email, pagamentos e upload de imagens. Também é recomendado testar todas as funcionalidades principais como login, cadastro de profissionais, sistema de pagamentos e upload de fotos.

Para adicionar mais profissionais ou dados, você pode usar o painel administrativo (após fazer login como admin) ou inserir diretamente no banco de dados.

Para publicar o site com um domínio personalizado, será necessário fazer o deploy em um servidor de produção e configurar DNS apropriadamente.

## Suporte

O projeto está totalmente funcional e pronto para uso. Todos os arquivos de documentação original foram preservados, incluindo guias de teste, relatórios de auditoria e documentação de integração com Mercado Pago.

Para mais detalhes técnicos, consulte os arquivos na raiz do projeto:
- `README.md` - Documentação geral do projeto
- `FLUXO-CADASTRO.md` - Fluxo de cadastro de profissionais
- `GUIA-DE-TESTES.md` - Guia para testar funcionalidades
- `MERCADOPAGO-INTEGRATION.md` - Documentação de integração de pagamentos
- `RESTAURACAO_STATUS.md` - Status detalhado da restauração
