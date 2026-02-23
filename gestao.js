<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Controle de Atestados</title>
    <link rel="stylesheet" href="style.css">
    <link rel="manifest" href="manifest.json">
</head>
<body class="bg-menu">

<div class="container">
    <div id="menuPrincipal" class="tela ativa">
        <h1>Controle de Atestados</h1>
        <p style="text-align: center; color: #7f8c8d; opacity: 0.8; font-size: 0.9em; margin-bottom: 10px;">Gestão de Atestados para Remição</p>
        <div id="statusSync" style="text-align: center; font-size: 0.7em; color: #27ae60; margin-bottom: 20px; font-weight: bold;">✓ Sistema Pronto</div>

        <div class="menu-grid">
            <button class="btn-menu verde" onclick="irPara('telaCadastrar')">📝 Cadastrar</button>
            <button class="btn-menu laranja" onclick="irPara('telaPesquisar')">🔍 Pesquisar</button>
            <button class="btn-menu azul" onclick="irPara('telaBanco')">📊 Banco</button>
            <button class="btn-menu lilas" onclick="irPara('telaArquivo')">📁 Arquivo</button>
        </div>
    </div>

    <div id="telaCadastrar" class="tela">
        <div class="conteudo-branco">
            <h2>📝 Novo Registro</h2>
            <div class="form-linha">
                <div class="col-3"><label>Matrícula</label><input type="text" id="regMatricula"></div>
                <div class="col-9"><label>Nome Completo</label><input type="text" id="regNome"></div>
            </div>
            <div class="form-linha">
                <div class="col-4">
                    <label>Solicitante</label>
                    <select id="regSolicitante">
                        <option value="">Selecione...</option>
                        <option>Advogado</option><option>DEECRIM</option><option>Defensoria</option><option>FUNAP</option>
                    </select>
                </div>
                <div class="col-4"><label>Data Pedido</label><input type="date" id="regDataPedido"></div>
                <div class="col-4">
                    <label>Tipo de Atestado</label>
                    <select id="regTipo">
                        <option value="">Selecione...</option>
                        <option>Trabalho</option><option>Educação</option><option>ENCCEJA</option><option>ENEM</option>
                    </select>
                </div>
            </div>
            <div class="form-linha">
                <div class="col-6"><label>Nº Grade</label><input type="text" id="regGrade" placeholder="0000/0000"></div>
                <div class="col-6"><label>Data Envio</label><input type="date" id="regDataEnvio"></div>
            </div>
            <button class="btn-acao verde" onclick="salvarNovo()">✅ Salvar Registro</button>
            <button class="btn-acao azul" style="background:#7f8c8d" onclick="irPara('menuPrincipal')">⬅️ Voltar</button>
        </div>
    </div>

    <div id="telaPesquisar" class="tela">
        <div class="conteudo-branco">
            <h2>🔍 Pesquisar Registro</h2>
            <div class="form-linha">
                <div class="col-6"><input type="text" id="inputBusca" placeholder="Nome ou Matrícula..." oninput="buscar()"></div>
                <div class="col-3">
                    <select id="filtroTipo" onchange="buscar()">
                        <option value="">Todos Tipos</option>
                        <option>Trabalho</option><option>Educação</option><option>ENCCEJA</option><option>ENEM</option>
                    </select>
                </div>
                <div class="col-3"><input type="date" id="filtroData" onchange="buscar()"></div>
            </div>
            <div id="resultadosBusca"></div>
            <button class="btn-acao laranja" onclick="irPara('menuPrincipal')">⬅️ Voltar</button>
        </div>
    </div>

    <div id="telaBanco" class="tela">
        <div class="conteudo-branco">
            <h2>📊 Banco de Dados (Consulta)</h2>
            <div class="barra-ferramentas">
                <button class="btn-ferramenta verde" onclick="exportarBackup()">💾 SALVAR BACKUP</button>
                <button class="btn-ferramenta laranja" onclick="document.getElementById('inputImport').click()">📂 ABRIR ARQUIVO</button>
                <input type="file" id="inputImport" style="display:none" onchange="importarBackup(event)">
            </div>
            <div id="listaBanco"></div>
            <button class="btn-acao azul" style="background:#7f8c8d" onclick="irPara('menuPrincipal')">⬅️ Voltar</button>
        </div>
    </div>

    <div id="telaArquivo" class="tela">
        <div class="conteudo-branco">
            <h2>📁 Arquivo Morto</h2>
            <p style="text-align:center; font-size: 0.8em; color: #7f8c8d;">Registros excluídos aparecem aqui.</p>
            <div id="listaArquivo"></div>
            <button class="btn-acao lilas" onclick="irPara('menuPrincipal')">⬅️ Voltar</button>
        </div>
    </div>

    <div id="telaEditar" class="tela">
        <div class="conteudo-branco">
            <h2>✏️ Atualizar Registro</h2>
            <input type="hidden" id="editId">
            <div class="form-linha">
                <div class="col-3"><label>Matrícula</label><input type="text" id="editMatricula"></div>
                <div class="col-9"><label>Nome Completo</label><input type="text" id="editNome"></div>
            </div>
            <div class="form-linha">
                <div class="col-4">
                    <label>Solicitante</label>
                    <select id="editSolicitante">
                        <option>Advogado</option><option>DEECRIM</option><option>Defensoria</option><option>FUNAP</option>
                    </select>
                </div>
                <div class="col-4"><label>Data Pedido</label><input type="date" id="editDataPedido"></div>
                <div class="col-4">
                    <label>Tipo de Atestado</label>
                    <select id="editTipo">
                        <option>Trabalho</option><option>Educação</option><option>ENCCEJA</option><option>ENEM</option>
                    </select>
                </div>
            </div>
            <div class="form-linha">
                <div class="col-6"><label>Nº Grade</label><input type="text" id="editGrade"></div>
                <div class="col-6"><label>Data Envio</label><input type="date" id="editDataEnvio"></div>
            </div>
            <button class="btn-acao verde" onclick="salvarEdicao()">💾 Salvar Alterações</button>
            <button class="btn-acao lilas" style="background:#e74c3c" onclick="excluirRegistro()">🗑️ EXCLUIR REGISTRO</button>
            <button class="btn-acao azul" style="background:#7f8c8d" onclick="irPara('menuPrincipal')">Cancelar</button>
        </div>
    </div>
</div>

<script src="gestao.js"></script>
</body>
</html>
