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
