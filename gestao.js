"use strict";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyBMoZOnyrkeNbLdBim6O3rO3vJHyxgNxXSmhcHPKoC6bjZqjRPcr8lAYl50gdHpYBr/exec"; 
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
    const dadosParaEnviar = db.filter(r => !r.sincronizado && !r.enviando);
    
    if (dadosParaEnviar.length === 0) {
        if(statusEl) statusEl.innerText = "✓ Sistema Pronto";
        return;
    }

    if(statusEl) statusEl.innerText = "⏳ Sincronizando...";

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
        }
    }
    localStorage.setItem('meu_sistema_db', JSON.stringify(db));
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
        if(idTela === 'menuPrincipal') sincronizarComGoogle();
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
        ativo: true,
        sincronizado: false
    };
    db.push(novo);
    salvarNoStorage();
    alert("✅ Salvo!");
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
            dataEnvio: document.getElementById('editDataEnvio').value,
            sincronizado: false 
        };
        salvarNoStorage();
        alert("✅ Atualizado!");
        irPara('telaPesquisar');
    }
}

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

function listarBanco() {
    const area = document.getElementById('listaBanco');
    area.innerHTML = "";
    db.filter(r => r.ativo).forEach(r => {
        const d = document.createElement('div');
        d.className = 'card-consulta';
        d.innerHTML = `<div><strong>${r.nome.toUpperCase()}</strong></div><div>${r.sincronizado ? '☁️' : '⏳'}</div>`;
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
    db[i].sincronizado = false;
    salvarNoStorage();
    irPara('telaArquivo');
}

// FUNÇÕES DE MANUTENÇÃO
function exportarBackup() {
    const blob = new Blob([JSON.stringify(db)], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const data = new Date().toLocaleDateString().replace(/\//g, '-');
    a.download = `backup_atestados_${data}.json`;
    a.click();
}

function importarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const dados = JSON.parse(e.target.result);
            if (confirm("Isso substituirá sua lista atual. Continuar?")) {
                db = dados;
                localStorage.setItem('meu_sistema_db', JSON.stringify(db));
                alert("✅ Backup restaurado!");
                irPara('menuPrincipal');
            }
        } catch(err) { alert("❌ Arquivo inválido."); }
    };
    reader.readAsText(file);
}

function limparSistemaTotal() {
    if (confirm("🚨 ATENÇÃO: Isso apaga todos os registros da pesquisa (tela). A planilha Google NÃO é afetada. Deseja resetar?")) {
        db = [];
        localStorage.removeItem('meu_sistema_db');
        alert("Sistema limpo!");
        location.reload();
    }
}

window.irPara = irPara; window.salvarNovo = salvarNovo; window.salvarEdicao = salvarEdicao;
window.excluirRegistro = excluirRegistro; window.buscar = buscar;
window.exportarBackup = exportarBackup; window.importarBackup = importarBackup; 
window.limparSistemaTotal = limparSistemaTotal; window.restaur
