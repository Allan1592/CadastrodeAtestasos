"use strict";

const SCRIPT_URL = "SUA_URL_AQUI"; // <--- COLE SUA URL ENTRE AS ASPAS
const UNIDADE_NOME = "UNIDADE_01"; // Identifica de onde veio o dado

let db = [];

function carregarDados() {
    const dadosSalvos = localStorage.getItem('meu_sistema_db');
    if (dadosSalvos) {
        try { db = JSON.parse(dadosSalvos); } catch (e) { db = []; }
    }
}

function salvarNoStorage() {
    localStorage.setItem('meu_sistema_db', JSON.stringify(db));
    sincronizarComGoogle(); // Tenta enviar sempre que salvar algo
}

async function sincronizarComGoogle() {
    const statusEl = document.getElementById('statusSync');
    const dadosParaEnviar = db.filter(r => !r.sincronizado);
    
    if (dadosParaEnviar.length === 0) {
        if(statusEl) statusEl.innerText = "✓ Tudo Sincronizado";
        return;
    }

    if(statusEl) statusEl.innerText = "⏳ Sincronizando com a Planilha...";

    for (let registro of dadosParaEnviar) {
        try {
            const response = await fetch(SCRIPT_URL, {
                method: "POST",
                mode: "no-cors", // Necessário para Google Script
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...registro, unidade: UNIDADE_NOME })
            });
            
            // Como usamos no-cors, não conseguimos ler o resultado, 
            // mas se não deu erro, marcamos como sincronizado
            registro.sincronizado = true;
        } catch (error) {
            if(statusEl) statusEl.innerText = "⚠️ Offline: Aguardando conexão";
            console.log("Erro de sync:", error);
        }
    }
    localStorage.setItem('meu_sistema_db', JSON.stringify(db));
}

function irPara(idTela) {
    document.body.classList.remove('bg-menu', 'bg-cadastrar', 'bg-pesquisar', 'bg-banco', 'bg-arquivo');
    document.querySelectorAll('.tela').forEach(t => t.style.display = 'none');
    
    const tela = document.getElementById(idTela);
    if (tela) {
        tela.style.display = 'block';
        if(idTela === 'menuPrincipal') {
            document.body.classList.add('bg-menu');
            sincronizarComGoogle(); // Tenta sincronizar ao voltar ao menu
        }
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
    alert("Salvo localmente! Sincronização em segundo plano.");
    document.querySelectorAll('#telaCadastrar input, #telaCadastrar select').forEach(i => i.value = "");
    irPara('menuPrincipal');
}

// Funções de listagem e busca (sem alteração na lógica, apenas mantendo a funcionalidade)
function listarBanco() {
    const area = document.getElementById('listaBanco');
    area.innerHTML = "";
    const ativos = db.filter(r => r.ativo);
    if(ativos.length === 0) { area.innerHTML = "<p style='text-align:center;'>Vazio.</p>"; return; }
    ativos.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-consulta';
        card.innerHTML = `<div><strong>${r.nome.toUpperCase()}</strong><br><small>Mat: ${r.matricula} | Tipo: ${r.tipoAtestado || '---'}</small></div><div style='color:#ccc; font-size:12px;'>${r.sincronizado ? 'NUVEM' : 'LOCAL'}</div>`;
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
        card.innerHTML = `<div><strong>${r.nome.toUpperCase()}</strong><br><small>Enviado em: ${r.dataEnvio || 'N/A'}</small></div>`;
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
        db[i].sincronizado = false; // Força re-sincronização com o dado novo
        salvarNoStorage();
        alert("Alterações salvas!");
        irPara('menuPrincipal');
    }
}

function excluirRegistro() {
    const id = parseInt(document.getElementById('editId').value);
    const i = db.findIndex(item => item.id === id);
    if (i !== -1 && confirm("Mover para o Arquivo Morto?")) {
        db[i].ativo = false;
        db[i].sincronizado = false;
        salvarNoStorage();
        irPara('menuPrincipal');
    }
}

function exportarBackup() {
    const blob = new Blob([JSON.stringify(db)], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup_atestados.json";
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
