"use strict";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbysCKXOu7tROsuyfsH2LF-FUxaUJ4gTBJ3ohECeOjBZzweOU1Q3NU72Y4khHPOInQSD/exec"; 
const UNIDADE_NOME = "UNIDADE_01"; 

let db = [];

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

async function sincronizarComGoogle() {
    const statusEl = document.getElementById('statusSync');
    const dadosParaEnviar = db.filter(r => !r.sincronizado);
    if (dadosParaEnviar.length === 0) {
        if(statusEl) statusEl.innerText = "✓ Sistema Pronto";
        return;
    }
    if(statusEl) statusEl.innerText = "⏳ Sincronizando com a Planilha...";
    for (let registro of dadosParaEnviar) {
        try {
            await fetch(SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...registro, unidade: UNIDADE_NOME })
            });
            registro.sincronizado = true;
        } catch (error) {
            if(statusEl) statusEl.innerText = "⚠️ Offline: Aguardando conexão";
        }
    }
    localStorage.setItem('meu_sistema_db', JSON.stringify(db));
}

function irPara(idTela) {
    document.querySelectorAll('.tela').forEach(t => t.style.display = 'none');
    document.body.className = ""; 
    const tela = document.getElementById(idTela);
    if (tela) {
        tela.style.display = 'block';
        if(idTela === 'menuPrincipal') { document.body.classList.add('bg-menu'); sincronizarComGoogle(); }
        if(idTela === 'telaCadastrar') document.body.classList.add('bg-cadastrar');
        if(idTela === 'telaPesquisar') { document.body.classList.add('bg-pesquisar'); buscar(); }
        if(idTela === 'telaBanco') { document.body.classList.add('bg-banco'); listarBanco(); }
        if(idTela === 'telaArquivo') { document.body.classList.add('bg-arquivo'); listarArquivo(); }
    }
}

function salvarNovo() {
    const nome = document.getElementById('regNome').value;
    const mat = document.getElementById('regMatricula').value;
    if(!nome || !mat) { alert("Preencha Nome e Matrícula!"); return; }
    const novo = {
        id: Date.now(),
        nome: nome,
        matricula: mat,
        solicitante: document.getElementById('regSolicitante').value,
        tipoAtestado: document.getElementById('regTipo').value,
        dataPedido: document.getElementById('regDataPedido').value,
        grade: document.getElementById('regGrade').value,
        dataEnvio: document.getElementById('regDataEnvio').value,
        ativo: true,
        sincronizado: false
    };
    db.push(novo);
    salvarNoStorage();
    alert("Cadastrado com sucesso!");
    document.querySelectorAll('#telaCadastrar input, #telaCadastrar select').forEach(i => i.value = "");
    irPara('menuPrincipal');
}

function buscar() {
    const termo = document.getElementById('inputBusca').value.toLowerCase();
    const tipo = document.getElementById('filtroTipo').value;
    const dataFiltro = document.getElementById('filtroData').value;
    const area = document.getElementById('resultadosBusca');
    area.innerHTML = "";
    let resultados = db.filter(r => r.ativo === true && (r.nome.toLowerCase().includes(termo) || r.matricula.toString().includes(termo)));
    if (tipo) resultados = resultados.filter(r => r.tipoAtestado === tipo);
    if (dataFiltro) resultados = resultados.filter(r => r.dataPedido === dataFiltro);
    resultados.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-clicavel';
        card.innerHTML = `<div><strong>${r.nome.toUpperCase()}</strong><br><small>Mat: ${r.matricula} | Pedido: ${r.dataPedido}</small></div><div style='color:#3498db; font-size:20px;'>➔</div>`;
        card.onclick = () => abrirEdicao(r.id);
        area.appendChild(card);
    });
}

function listarArquivo() {
    const area = document.getElementById('listaArquivo');
    area.innerHTML = "";
    const arquivados = db.filter(r => r.ativo === false);
    if(arquivados.length === 0) { area.innerHTML = "<p style='text-align:center;'>Arquivo vazio.</p>"; return; }
    arquivados.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-consulta';
        card.style.borderLeftColor = "#e74c3c";
        card.innerHTML = `<div><strong>${r.nome.toUpperCase()}</strong><br><small>Mat: ${r.matricula}</small></div><button onclick="restaurarRegistro(${r.id})" style="padding:10px; cursor:pointer; background:#27ae60; color:white; border:none; border-radius:5px;">Restaurar</button>`;
        area.appendChild(card);
    });
}

function restaurarRegistro(id) {
    const i = db.findIndex(item => item.id === id);
    if (i !== -1) {
        db[i].ativo = true;
        db[i].sincronizado = false;
        salvarNoStorage();
        alert("Restaurado!");
        listarArquivo();
    }
}

function abrirEdicao(id) {
    const r = db.find(item => item.id === id);
    if (!r) return;
    document.getElementById('editId').value = r.id;
    document.getElementById('editMatricula').value = r.matricula;
    document.getElementById('editNome').value = r.nome;
    document.getElementById('editSolicitante').value = r.solicitante || "";
    document.getElementById('editDataPedido').value = r.dataPedido || "";
    document.getElementById('editTipo').value = r.tipoAtestado || "";
    document.getElementById('editGrade').value = r.grade || "";
    document.getElementById('editDataEnvio').value = r.dataEnvio || "";
    irPara('telaEditar');
}

function salvarEdicao() {
    const id = parseInt(document.getElementById('editId').value);
    const i = db.findIndex(item => item.id === id);
    if (i !== -1) {
        db[i].nome = document.getElementById('editNome').value;
        db[i].matricula = document.getElementById('editMatricula').value;
        db[i].solicitante = document.getElementById('editSolicitante').value;
        db[i].dataPedido = document.getElementById('editDataPedido').value;
        db[i].tipoAtestado = document.getElementById('editTipo').value;
        db[i].grade = document.getElementById('editGrade').value;
        db[i].dataEnvio = document.getElementById('editDataEnvio').value;
        db[i].sincronizado = false;
        salvarNoStorage();
        alert("Salvo!");
        irPara('menuPrincipal');
    }
}

function excluirRegistro() {
    const id = parseInt(document.getElementById('editId').value);
    const i = db.findIndex(item => item.id === id);
    if (i !== -1 && confirm("Excluir este registro?")) {
        db[i].ativo = false;
        db[i].sincronizado = false;
        salvarNoStorage();
        irPara('menuPrincipal');
    }
}

function listarBanco() {
    const area = document.getElementById('listaBanco');
    area.innerHTML = "";
    const ativos = db.filter(r => r.ativo);
    if(ativos.length === 0) { area.innerHTML = "<p style='text-align:center;'>Vazio.</p>"; return; }
    ativos.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-consulta';
        card.innerHTML = `<div><strong>${r.nome.toUpperCase()}</strong><br><small>Mat: ${r.matricula}</small></div><div style='color:#ccc; font-size:10px;'>${r.sincronizado ? 'NUVEM' : 'LOCAL'}</div>`;
        area.appendChild(card);
    });
}

function exportarBackup() {
    const blob = new Blob([JSON.stringify(db)], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup.json";
    a.click();
}

function importarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try { db = JSON.parse(e.target.result); salvarNoStorage(); alert("Importado!"); irPara('menuPrincipal'); } 
        catch(err) { alert("Erro!"); }
    };
    reader.readAsText(file);
}

carregarDados();
window.irPara = irPara; window.salvarNovo = salvarNovo; window.salvarEdicao = salvarEdicao;
window.excluirRegistro = excluirRegistro; window.buscar = buscar;
window.exportarBackup = exportarBackup; window.importarBackup = importarBackup;
window.restaurarRegistro = restaurarRegistro;
