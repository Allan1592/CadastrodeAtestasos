"use strict";

let db = [];

function carregarDados() {
    const dadosSalvos = localStorage.getItem('meu_sistema_db');
    if (dadosSalvos) {
        try { db = JSON.parse(dadosSalvos); } catch (e) { db = []; }
    }
}

function salvarNoStorage() {
    localStorage.setItem('meu_sistema_db', JSON.stringify(db));
}

function irPara(idTela) {
    document.body.classList.remove('bg-menu', 'bg-cadastrar', 'bg-pesquisar', 'bg-banco', 'bg-arquivo');
    document.querySelectorAll('.tela').forEach(t => t.style.display = 'none');
    
    const tela = document.getElementById(idTela);
    if (tela) {
        tela.style.display = 'block';
        if(idTela === 'menuPrincipal') document.body.classList.add('bg-menu');
        if(idTela === 'telaCadastrar') document.body.classList.add('bg-cadastrar');
        if(idTela === 'telaPesquisar') document.body.classList.add('bg-pesquisar');
        if(idTela === 'telaBanco') document.body.classList.add('bg-banco');
        if(idTela === 'telaArquivo') document.body.classList.add('bg-arquivo');
    }
    if(idTela === 'telaBanco') listarBanco();
    if(idTela === 'telaArquivo') listarArquivo();
}

function salvarNovo() {
    const nome = document.getElementById('regNome').value;
    const mat = document.getElementById('regMatricula').value;
    const sol = document.getElementById('regSolicitante').value;
    const tipo = document.getElementById('regTipo').value;
    const data = document.getElementById('regDataPedido').value;

    if(!nome || !mat) { alert("Preencha Nome e Matrícula!"); return; }

    db.push({
        id: Date.now(),
        nome: nome,
        matricula: mat,
        solicitante: sol,
        tipoAtestado: tipo,
        dataPedido: data,
        grade: "", dataEnvio: "", ativo: true
    });

    salvarNoStorage();
    alert("Cadastrado com sucesso!");
    irPara('menuPrincipal');
}

function listarBanco() {
    const area = document.getElementById('listaBanco');
    area.innerHTML = "";
    const ativos = db.filter(r => r.ativo);
    if(ativos.length === 0) { area.innerHTML = "<p style='text-align:center;'>Vazio.</p>"; return; }

    ativos.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-consulta';
        card.innerHTML = `<div><strong>${r.nome.toUpperCase()}</strong><br><small>Mat: ${r.matricula} | Tipo: ${r.tipoAtestado || '---'}</small></div><div style='color:#ccc; font-size:12px;'>CONSULTA</div>`;
        area.appendChild(card);
    });
}

function listarArquivo() {
    const area = document.getElementById('listaArquivo');
    area.innerHTML = "";
    const arquivados = db.filter(r => !r.ativo);
    arquivados.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-consulta';
        card.style.borderLeftColor = "#9b59b6";
        card.innerHTML = `<div><strong>${r.nome.toUpperCase()}</strong><br><small>Enviado em: ${r.dataEnvio}</small></div>`;
        area.appendChild(card);
    });
}

function buscar() {
    const termo = document.getElementById('inputBusca').value.toLowerCase();
    const area = document.getElementById('resultadosBusca');
    area.innerHTML = "";
    if (termo.trim() === "") return;

    const resultados = db.filter(r => r.nome.toLowerCase().includes(termo) || r.matricula.toString().includes(termo));
    
    resultados.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-clicavel';
        card.style.borderLeftColor = r.ativo ? "#27ae60" : "#9b59b6";
        card.innerHTML = `<div><strong>${r.nome.toUpperCase()}</strong><br><small>Mat: ${r.matricula} | Tipo: ${r.tipoAtestado || '---'}</small></div><div style='color:#3498db; font-size:20px;'>➔</div>`;
        card.onclick = () => abrirEdicao(r.id);
        area.appendChild(card);
    });
}

function abrirEdicao(id) {
    const r = db.find(item => item.id === id);
    if (!r) return;
    document.getElementById('editId').value = r.id;
    document.getElementById('editNome').value = r.nome;
    document.getElementById('editTipo').value = r.tipoAtestado || "";
    document.getElementById('editGrade').value = r.grade || "";
    document.getElementById('editDataEnvio').value = r.dataEnvio || "";
    irPara('telaEditar');
}

function salvarEdicao() {
    const id = parseInt(document.getElementById('editId').value);
    const i = db.findIndex(item => item.id === id);
    if (i !== -1) {
        db[i].tipoAtestado = document.getElementById('editTipo').value;
        db[i].grade = document.getElementById('editGrade').value;
        db[i].dataEnvio = document.getElementById('editDataEnvio').value;
        salvarNoStorage();
        alert("Salvo!");
        irPara('menuPrincipal');
    }
}

function excluirRegistro() {
    const id = parseInt(document.getElementById('editId').value);
    const i = db.findIndex(item => item.id === id);
    if (i !== -1 && confirm("Arquivar este registro?")) {
        db[i].ativo = false;
        salvarNoStorage();
        irPara('menuPrincipal');
    }
}

function exportarBackup() {
    const blob = new Blob([JSON.stringify(db)], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup_sistema.json";
    a.click();
}

function importarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            db = JSON.parse(e.target.result);
            salvarNoStorage();
            alert("Sucesso!");
            irPara('menuPrincipal');
        } catch(err) { alert("Erro!"); }
    };
    reader.readAsText(file);
}

carregarDados();
window.irPara = irPara; window.salvarNovo = salvarNovo; window.salvarEdicao = salvarEdicao;
window.excluirRegistro = excluirRegistro; window.buscar = buscar;
window.exportarBackup = exportarBackup; window.importarBackup = importarBackup;
