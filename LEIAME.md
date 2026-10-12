# Nature Books

Biblioteca e livraria digital inspirada na natureza: catálogo com mais de 1.000 livros, filtros, página de cada livro, sacola de compras e contas de leitor (login e registro).

## Rodar no seu computador

Dê dois cliques em `iniciar.bat`, ou rode:

```bash
python server.py
```

e acesse http://localhost:8000. As contas ficam em `nature_books.db` (SQLite), criado automaticamente.

## Publicar na Vercel (GitHub + Neon Postgres)

1. **GitHub:** crie um repositório vazio (sem README) e envie este projeto:
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/nature-books.git
   git push -u origin main
   ```
2. **Vercel:** em vercel.com, clique em **Add New → Project**, importe o repositório e clique em **Deploy**. Não precisa mudar nenhuma configuração.
3. **Banco:** no projeto da Vercel, abra **Storage → Create Database → Neon (Postgres)**, crie o banco e conecte ao projeto. A Vercel adiciona a variável `DATABASE_URL` sozinha.
4. **Atualizar:** em **Deployments**, clique nos três pontinhos do último deploy e em **Redeploy**, para a função passar a enxergar o banco.
5. **Testar:** abra o site, crie uma conta e recarregue a página. Se o nome continuar no ícone de conta, o banco está funcionando. As tabelas são criadas no primeiro acesso.

Depois disso, cada `git push` publica uma nova versão automaticamente.

## Estrutura

| Arquivo | Para que serve |
|---|---|
| `index.html`, `style.css`, `script.js` | Página, estilos e catálogo/carrinho |
| `livros.js` | Catálogo ampliado (livros do Open Library) |
| `auth.js` | Janela de login/registro e menu da conta |
| `api/_nb.py` | Lógica das contas: SQLite no computador, Postgres na Vercel |
| `api/index.py` | Função da Vercel que atende `/api/*` |
| `server.py`, `iniciar.bat` | Servidor local (não vão para a Vercel) |
| `vercel.json`, `requirements.txt` | Configuração da Vercel e dependência do Postgres |

Projeto demonstrativo: preços fictícios, capas via Open Library.
