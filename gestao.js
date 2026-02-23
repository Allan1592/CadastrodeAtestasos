"use strict";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx7TOXz-PXVA2G41ZVixKLLSe-7PiYPKEuwYOC1vFTvPAyGnfWTHNMhpyQL2E1ovfys/exec"; 
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
    if(statusEl) statusEl.innerText = "⏳ Sincronizando...";
    for (let registro of dadosParaEnviar) {
        try {
            await fetch(SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...registro, unidade: UNIDADE_NOME })
            });
            registro.sincronizado = true;
        } catch (e) {}
    }
    localStorage.setItem('meu_sistema_db', JSON.stringify(db));
}

function irPara(idTela) {
    document.querySelectorAll('.tela').forEach(t => t.style.display = 'none');
    const tela = document.getElementById(idTela);
    if (tela) {
        tela.style.display = 'block';
        if(idTela === 'telaPesquisar') buscar();
        if(idTela === 'menuPrincipal') sincronizarComGoogle();
    }
}

// VALIDAÇÃO: Não permite campos vazios
function validarCampos(prefixo) {
    const campos = [
        {id: 'Matricula', nome: 'Matrícula'},
        {id: 'Nome', nome: 'Nome'},
        {id: 'Solicitante', nome: 'Solicitante'},
        {id: 'DataPedido', nome: 'Data do Pedido'},
        {id: 'Tipo', nome: 'Tipo de Atestado'},
        {id: 'Grade', nome: 'Nº da Grade'},
        {id: 'DataEnvio', nome: 'Data de Envio'}
    ];
    for (let c of campos) {
        const valor = document.getElementById(prefixo + c.id).value;
        if (!valor || valor.trim() === "") {
            alert("⚠️ Atenção: O campo [" + c.nome + "] é obrigatório.");
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
    alert("✅ Registro salvo com sucesso!");
    // Limpar campos
    document.querySelectorAll('#telaCadastrar input, #telaCadastrar select').forEach(i => i.value = "");
    irPara('menuPrincipal');
}

function buscar() {
    const termo = document.getElementById('inputBusca').value.toLowerCase();
    const area = document.getElementById('resultadosBusca');
    area.innerHTML = "";
    
    let resultados = db.filter(r => r.ativo === true && 
        (r.nome.toLowerCase().includes(termo) || r.matricula.includes(termo)));

    resultados.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-clicavel';
        
        // Layout Espelhado e Horizontal
        card.innerHTML = `
            <div style="width:100%">
                <div style="border-bottom: 2px solid #3498db; padding-bottom:5px; margin-bottom:8px; display: flex; justify-content: space-between;">
                    <span style="font-size: 1.1em;"><strong>${r.matricula}</strong></span>
                    <span style="font-size: 1.1em;"><strong>${r.nome.toUpperCase()}</strong></span>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 15px; font-size: 0.85em; color: #444;">
                    <span><strong>Solicitante:</strong> ${r.solicitante}</span>
                    <span><strong>|</strong></span>
                    <span><strong>Pedido:</strong> ${r.dataPedido}</span>
                    <span><strong>|</strong></span>
                    <span><strong>Tipo:</strong> ${r.tipoAtestado}</span>
                    <span><strong>|</strong></span>
                    <span><strong>Grade:</strong> ${r.grade}</span>
                    <span><strong>|</strong></span>
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
        alert("✅ Alterações salvas!");
        irPara('telaPesquisar'); // Volta para a pesquisa como solicitado
    }
}

function excluirRegistro() {
    const id = parseInt(document.getElementById('editId').value);
    if (confirm("Deseja realmente mover este registro para o Arquivo Morto?")) {
        const i = db.findIndex(item => item.id === id);
        db[i].ativo = false;
        db[i].sincronizado = false;
        salvarNoStorage();
        irPara('telaPesquisar'); // Volta para a pesquisa
    }
}

carregarDados();
window.irPara = irPara; window.salvarNovo = salvarNovo; window.salvarEdicao = salvarEdicao;
window.excluirRegistro = excluirRegistro; window.buscar = buscar;
