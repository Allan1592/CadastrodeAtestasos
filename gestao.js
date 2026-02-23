"use strict";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyBMoZOnyrkeNbLdBim6O3rO3vJHyxgNxXSmhcHPKoC6bjZqjRPcr8lAYl50gdHpYBr/exec"; 
const UNIDADE_NOME = "UNIDADE_01"; 

let db = [];

// CARREGAR DADOS AO INICIAR
function carregarDados() {
    const dadosSalvos = localStorage.getItem('meu_sistema_db');
    if (dadosSalvos) {
        try { db = JSON.parse(dadosSalvos); } catch (e) { db = []; }
    }
}

function salvarNoStorage() {
    localStorage.setItem('meu_sistema_db', JSON.stringify(db));
    sincronizarComGoogle();
}

// SINCRONIZAÇÃO COM PROTEÇÃO CONTRA DUPLICIDADE
async function sincronizarComGoogle() {
    const statusEl = document.getElementById('statusSync');
    const dadosParaEnviar = db.filter(r => !r.sincronizado && !r.enviando);
    
    if (dadosParaEnviar.length === 0) {
        if(statusEl) statusEl.innerText = "✓ Sistema Pronto";
        return;
    }

    if(statusEl) statusEl.innerText = "⏳ Sincronizando com a Planilha...";

    for (let registro of dadosParaEnviar) {
        registro.enviando = true; 
        try {
            await fetch(SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...registro, unidade: UNIDADE_NOME })
            });
            registro.sincronizado = true;
            delete registro.enviando;
        } catch (e) {
            delete registro.enviando;
            if(statusEl) statusEl.innerText = "⚠️ Erro de conexão";
        }
    }
    localStorage.setItem('meu_sistema_db', JSON.stringify(db));
}

// NAVEGAÇÃO ENTRE TELAS (COM LIMPEZA DE PESQUISA)
function irPara(idTela) {
    document.querySelectorAll('.tela').forEach(t => t.style.display = 'none');
    const tela = document.getElementById(idTela);
    if (tela) {
        tela.style.display = 'block';
        
        // Se for para tela de pesquisar, limpa tudo para não mostrar lista velha
        if(idTela === 'telaPesquisar') {
            document.getElementById('inputBusca').value = "";
            document.getElementById('resultadosBusca').innerHTML = "";
        }
        
        if(idTela === 'telaBanco') listarBanco();
        if(idTela === 'telaArquivo') listarArquivo();
        if(idTela === 'menuPrincipal') sincronizarComGoogle();
    }
}

// VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS
function validarCampos(prefixo) {
    const campos = ['Matricula', 'Nome', 'Solicitante', 'DataPedido', 'Tipo', 'Grade', 'DataEnvio'];
    for (let c of campos) {
        const valor = document.getElementById(prefixo + c).value;
        if (!valor || valor.trim() === "") {
            alert("Atenção: Preencha todos os campos antes de continuar!");
            return false;
        }
    }
    return true;
}

// SALVAR NOVO REGISTRO
function salvarNovo() {
    if (!validarCampos('reg')) return;

    const novo = {
        id: Date.now(),
        matricula: document.getElementById('regMatricula').value,
        nome: document.getElementById('regNome').value,
        solicitante: document.getElementById('regSolicitante').value,
        dataPedido: document.getElementById('regDataPedido').value,
        tipoAtestado: document.getElementById('regTipo').value,
        grade: document.getElementById('regGrade').value,
        dataEnvio: document.getElementById('regDataEnvio').value,
        ativo: true,
        sincronizado: false
    };
    db.push(novo);
    salvarNoStorage();
    alert("✅ Cadastrado com sucesso!");
    document.querySelectorAll('#telaCadastrar input, #telaCadastrar select').forEach(i => i.value = "");
    irPara('menuPrincipal');
}

// BUSCA DETALHADA E ESPELHADA (SÓ APARECE SE DIGITAR)
function buscar() {
    const termo = document.getElementById('inputBusca').value.toLowerCase();
    const area = document.getElementById('resultadosBusca');
    
    if (termo.length < 1) {
        area.innerHTML = "";
        return;
    }

    area.innerHTML = "";
    let resultados = db.filter(r => r.ativo === true && 
        (r.nome.toLowerCase().includes(termo) || r.matricula.includes(termo)));

    resultados.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-clicavel';
        card.innerHTML = `
            <div style="width:100%">
                <div style="border-bottom: 2px solid #3498db; padding-bottom:5px; margin-bottom:8px;">
                    <span style="font-size: 1.1em;"><strong>${r.matricula} | ${r.nome.toUpperCase()}</strong></span>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; font-size: 0.85em; color: #444;">
                    <span>${r.solicitante}</span> <span style="color:#ccc">|</span>
                    <span><strong>Pedido:</strong> ${r.dataPedido}</span> <span style="color:#ccc">|</span>
                    <span>${r.tipoAtestado}</span> <span style="color:#ccc">|</span>
                    <span><strong>Grade:</strong> ${r.grade}</span> <span style="color:#ccc">|</span>
                    <span><strong>Envio:</strong> ${r.dataEnvio}</span>
                </div>
            </div>
        `;
        card.onclick = () => abrirEdicao(r.id);
        area.appendChild(card);
    });
}

// ABRIR EDIÇÃO
function abrirEdicao(id) {
    const r = db.find(item => item.id === id);
    if (!r) return;
    document.getElementById('editId').value = r.id;
    document.getElementById('editMatricula').value = r.matricula;
    document.getElementById('editNome').value = r.nome;
    document.getElementById('editSolicitante').value = r.solicitante;
    document.getElementById('editDataPedido').value = r.dataPedido;
    document.getElementById('editTipo').value = r.tipoAtestado;
    document.getElementById('editGrade').value = r.grade;
    document.getElementById('editDataEnvio').value = r.dataEnvio;
    irPara('telaEditar');
}

// SALVAR EDIÇÃO
function salvarEdicao() {
    if (!validarCampos('edit')) return;
    const id = parseInt(document.getElementById('editId').value);
    const i = db.findIndex(item => item.id === id);
    if (i !== -1) {
        db[i] = { ...db[i], 
            nome: document.getElementById('editNome').value,
            matricula: document.getElementById('editMatricula').value,
            solicitante: document.getElementById('editSolicitante').value,
            dataPedido: document.getElementById('editDataPedido').value,
            tipoAtestado: document.getElementById('editTipo').value,
            grade: document.getElementById('editGrade').value,
            dataEnvio: document.getElementById('editDataEnvio').value,
            sincronizado: false 
        };
        salvarNoStorage();
        alert("✅ Registro atualizado!");
        irPara('telaPesquisar');
    }
}

// EXCLUIR (MOVER PARA ARQUIVO)
function excluirRegistro() {
    const id = parseInt(document.getElementById('editId').value);
    if (confirm("Mover para o Arquivo Morto?")) {
        const i = db.findIndex(item => item.id === id);
        db[i].ativo = false;
        db[i].sincronizado = false;
        salvarNoStorage();
        irPara('telaPesquisar');
    }
}

// LISTAR NO BANCO
function listarBanco() {
    const area = document.getElementById('listaBanco');
    area.innerHTML = "";
    const ativos = db.filter(r => r.ativo);
    ativos.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-consulta';
        card.innerHTML = `<div><strong>${r.nome.toUpperCase()}</strong><br><small>Mat: ${r.matricula}</small></div><div>${r.sincronizado ? '☁️' : '⏳'}</div>`;
        area.appendChild(card);
    });
}

// LISTAR NO ARQUIVO
function listarArquivo() {
    const area = document.getElementById('listaArquivo');
    area.innerHTML = "";
    const arquivados = db.filter(r => !r.ativo);
    arquivados.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-consulta';
        card.innerHTML = `<div><strong>${r.nome.toUpperCase()}</strong></div><button onclick="restaurar(${r.id})">Restaurar</button>`;
        area.appendChild(card);
    });
}

function restaurar(id) {
    const i = db.findIndex(r => r.id === id);
    db[i].ativo = true;
    db[i].sincronizado = false;
    salvarNoStorage();
    irPara('telaArquivo');
}

function exportarBackup() {
    const blob = new Blob([JSON.stringify(db)], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup_atestados.json";
    a.click();
}

carregarDados();
