let db = JSON.parse(localStorage.getItem('meu_sistema_db')) || [];

function salvarNoStorage() {
    localStorage.setItem('meu_sistema_db', JSON.stringify(db));
}

function irPara(idTela) {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
    document.getElementById(idTela).classList.add('ativa');
    if(idTela === 'telaBanco') listarBanco();
    if(idTela === 'telaArquivo') listarArquivoMorto();
}

function salvarNovo() {
    const nome = document.getElementById('regNome').value;
    const mat = document.getElementById('regMatricula').value;
    if(!nome || !mat) return alert("Preencha Nome e Matrícula!");

    db.push({
        id: Date.now(),
        nome: nome,
        matricula: mat,
        solicitante: document.getElementById('regSolicitante').value,
        dataPedido: document.getElementById('regDataPedido').value,
        grade: "", dataEnvio: "", ativo: true
    });
    salvarNoStorage();
    alert("Cadastrado!");
    irPara('menuPrincipal');
}

function listarBanco() {
    const area = document.getElementById('listaBanco');
    area.innerHTML = "";
    db.filter(r => r.ativo).forEach(r => {
        area.innerHTML += `
            <div class="card">
                <strong>${r.nome.toUpperCase()}</strong><br>
                <small>Mat: ${r.matricula}</small><br>
                <button class="btn-acao azul" style="padding:5px; height:auto; margin-top:5px" onclick="abrirEdicao(${r.id})">EDITAR</button>
            </div>`;
    });
}

function abrirEdicao(id) {
    const r = db.find(x => x.id === id);
    document.getElementById('editId').value = r.id;
    document.getElementById('editNome').value = r.nome;
    document.getElementById('editGrade').value = r.grade;
    document.getElementById('editDataEnvio').value = r.dataEnvio;
    irPara('telaEditar');
}

function salvarEdicao() {
    const id = document.getElementById('editId').value;
    const r = db.find(x => x.id == id);
    r.grade = document.getElementById('editGrade').value;
    r.dataEnvio = document.getElementById('editDataEnvio').value;
    salvarNoStorage();
    alert("Atualizado!");
    irPara('menuPrincipal');
}

function exportarBackup() {
    const data = JSON.stringify(db);
    const blob = new Blob([data], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup_sistema.json";
    a.click();
}

function importarBackup(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
        db = JSON.parse(e.target.result);
        salvarNoStorage();
        alert("Backup Carregado!");
        irPara('menuPrincipal');
    };
    reader.readAsText(event.target.files[0]);
}

function excluirRegistro() {
    if(confirm("Mover para o Arquivo?")) {
        const id = document.getElementById('editId').value;
        db.find(x => x.id == id).ativo = false;
        salvarNoStorage();
        irPara('menuPrincipal');
    }
}
