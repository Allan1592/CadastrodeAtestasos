"use strict";

let db = [];

// Carregamento Inicial
function carregarDados() {
    const dadosSalvos = localStorage.getItem('meu_sistema_db');
    if (dadosSalvos) {
        try {
            db = JSON.parse(dadosSalvos);
        } catch (e) {
            db = [];
        }
    }
}

function salvarNoStorage() {
    localStorage.setItem('meu_sistema_db', JSON.stringify(db));
}

function irPara(idTela) {
    document.querySelectorAll('.tela').forEach(t => t.style.display = 'none');
    const tela = document.getElementById(idTela);
    if (tela) tela.style.display = 'block';

    if(idTela === 'telaBanco') listarBanco();
    if(idTela === 'telaArquivo') listarArquivo();
}

// CADASTRO
function salvarNovo() {
    const nome = document.getElementById('regNome').value;
    const mat = document.getElementById('regMatricula').value;
    const sol = document.getElementById('regSolicitante').value;
    const data = document.getElementById('regDataPedido').value;

    if(!nome || !mat) { alert("Preencha Nome e Matrícula!"); return; }

    db.push({
        id: Date.now(),
        nome: nome,
        matricula: mat,
        solicitante: sol,
        dataPedido: data,
        grade: "", dataEnvio: "", ativo: true
    });

    salvarNoStorage();
    alert("Cadastrado!");
    document.getElementById('regNome').value = "";
    document.getElementById('regMatricula').value = "";
    irPara('menuPrincipal');
}

// LISTAGEM BANCO ATIVO
function listarBanco() {
    const area = document.getElementById('listaBanco');
    if (!area) return;
    area.innerHTML = "";
    const ativos = db.filter(r => r.ativo);
    
    if(ativos.length === 0) {
        area.innerHTML = "<p style='text-align:center; padding:30px;'>Banco Vazio.</p>";
        return;
    }

    ativos.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-clicavel';
        card.innerHTML = `<div><strong>${r.nome.toUpperCase()}</strong><br><small>Mat: ${r.matricula}</small></div><div>➔</div>`;
        card.onclick = () => abrirEdicao(r.id);
        area.appendChild(card);
    });
}

// LISTAGEM ARQUIVO MORTO
function listarArquivo() {
    const area = document.getElementById('listaArquivo');
    if (!area) return;
    area.innerHTML = "";
    const arquivados = db.filter(r => !r.ativo);
    
    arquivados.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-clicavel';
        card.style.borderLeftColor = "#9b59b6";
        card.innerHTML = `<div><strong>${r.nome.toUpperCase()}</strong><br><small>Enviado em: ${r.dataEnvio}</small></div>`;
        area.appendChild(card);
    });
}

// EDIÇÃO E BUSCA
function abrirEdicao(id) {
    const registro = db.find(r => r.id === id);
    if (!registro) return;

    document.getElementById('editId').value = registro.id;
    document.getElementById('editNome').value = registro.nome;
    document.getElementById('editGrade').value = registro.grade || "";
    document.getElementById('editDataEnvio').value = registro.dataEnvio || "";
    
    irPara('telaEditar');
}

function salvarEdicao() {
    const id = parseInt(document.getElementById('editId').value);
    const index = db.findIndex(r => r.id === id);
    
    if (index !== -1) {
        db[index].grade = document.getElementById('editGrade').value;
        db[index].dataEnvio = document.getElementById('editDataEnvio').value;
        salvarNoStorage();
        alert("Atualizado!");
        irPara('telaBanco');
    }
}

function excluirRegistro() {
    const id = parseInt(document.getElementById('editId').value);
    const index = db.findIndex(r => r.id === id);
    
    if (index !== -1 && confirm("Mover para o Arquivo Morto?")) {
        db[index].ativo = false;
        salvarNoStorage();
        irPara('telaBanco');
    }
}

function buscar() {
    const termo = document.getElementById('inputBusca').value.toLowerCase();
    const area = document.getElementById('resultadosBusca');
    if (termo.trim() === "") { area.innerHTML = ""; return; }

    const resultados = db.filter(r => r.nome.toLowerCase().includes(termo) || r.matricula.toString().includes(termo));
    area.innerHTML = "";

    resultados.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-clicavel';
        card.style.borderLeftColor = r.ativo ? "#27ae60" : "#9b59b6";
        card.innerHTML = `<div><strong>${r.nome.toUpperCase()}</strong><br><small>Status: ${r.ativo ? 'ATIVO' : 'ARQUIVO'}</small></div>`;
        card.onclick = () => abrirEdicao(r.id);
        area.appendChild(card);
    });
}

// BACKUP
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
            alert("Backup Carregado!");
            irPara('menuPrincipal');
        } catch(err) { alert("Erro no arquivo."); }
    };
    reader.readAsText(file);
}

// Inicialização
carregarDados();

// Globais para o HTML
window.irPara = irPara;
window.salvarNovo = salvarNovo;
window.salvarEdicao = salvarEdicao;
window.excluirRegistro = excluirRegistro;
window.buscar = buscar;
window.exportarBackup = exportarBackup;
window.importarBackup = importarBackup;
window.abrirEdicao = abrirEdicao;
