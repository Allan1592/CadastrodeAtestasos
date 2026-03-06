"use strict";

// IMPORTANTE: Esses comandos permitem que o programa escreva no seu HD
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(process.cwd(), 'banco_dados.json');

let db = [];

// Função que lê o arquivo no HD assim que o programa abre
function carregarDados() {
    try {
        if (fs.existsSync(DB_PATH)) {
            const data = fs.readFileSync(DB_PATH, 'utf8');
            db = JSON.parse(data);
        } else {
            db = [];
            salvarNoDisco(); 
        }
    } catch (e) {
        db = [];
    }
}

// Função que salva os dados no arquivo JSON na pasta do programa
function salvarNoDisco() {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    } catch (e) {
        alert("Erro ao salvar no computador: " + e);
    }
}

function irPara(idTela) {
    document.querySelectorAll('.tela').forEach(t => t.style.display = 'none');
    const tela = document.getElementById(idTela);
    if (tela) {
        tela.style.display = 'block';
        if(idTela === 'telaPesquisar') {
            document.getElementById('inputBusca').value = "";
            document.getElementById('resultadosBusca').innerHTML = "";
        }
        if(idTela === 'telaBanco') listarBanco();
        if(idTela === 'telaArquivo') listarArquivo();
    }
}

function validarCampos(prefixo) {
    const campos = ['Matricula', 'Nome', 'Solicitante', 'DataPedido', 'Tipo', 'Grade', 'DataEnvio'];
    for (let c of campos) {
        const valor = document.getElementById(prefixo + c).value;
        if (!valor || valor.trim() === "") {
            alert("⚠️ Por favor, preencha todos os campos.");
            return false;
        }
    }
    return true;
}

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
        ativo: true
    };
    db.push(novo);
    salvarNoDisco();
    alert("✅ Salvo no Computador!");
    document.querySelectorAll('#telaCadastrar input, #telaCadastrar select').forEach(i => i.value = "");
    irPara('menuPrincipal');
}

function buscar() {
    const termo = document.getElementById('inputBusca').value.toLowerCase();
    const area = document.getElementById('resultadosBusca');
    if (termo.length < 1) { area.innerHTML = ""; return; }
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
            dataEnvio: document.getElementById('editDataEnvio').value
        };
        salvarNoDisco();
        alert("✅ Atualizado!");
        irPara('telaPesquisar');
    }
}

function excluirRegistro() {
    const id = parseInt(document.getElementById('editId').value);
    if (confirm("Mover para o Arquivo Morto?")) {
        const i = db.findIndex(item => item.id === id);
        db[i].ativo = false;
        salvarNoDisco();
        irPara('telaPesquisar');
    }
}

function listarBanco() {
    const area = document.getElementById('listaBanco');
    area.innerHTML = "";
    db.filter(r => r.ativo).forEach(r => {
        const d = document.createElement('div');
        d.className = 'card-consulta';
        d.innerHTML = `<div><strong>${r.nome.toUpperCase()}</strong></div><div>💻 Local</div>`;
        area.appendChild(d);
    });
}

function listarArquivo() {
    const area = document.getElementById('listaArquivo');
    area.innerHTML = "";
    db.filter(r => !r.ativo).forEach(r => {
        const d = document.createElement('div');
        d.className = 'card-consulta';
        d.innerHTML = `<div><strong>${r.nome.toUpperCase()}</strong></div><button onclick="restaurar(${r.id})">Restaurar</button>`;
        area.appendChild(d);
    });
}

function restaurar(id) {
    const i = db.findIndex(r => r.id === id);
    db[i].ativo = true;
    salvarNoDisco();
    irPara('telaArquivo');
}

// Torna as funções visíveis para o HTML
window.irPara = irPara; 
window.salvarNovo = salvarNovo; 
window.salvarEdicao = salvarEdicao;
window.excluirRegistro = excluirRegistro; 
window.buscar = buscar;
window.restaurar = restaurar;

// Inicia o sistema carregando os dados do HD
carregarDados();
