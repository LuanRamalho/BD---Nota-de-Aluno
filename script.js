let alunoEmRecuperacao = null;
let alunoEditando = null;

document.addEventListener('DOMContentLoaded', () => {
    exibirResultados();
});

function adicionarAluno() {
    const matricula = document.getElementById('matricula').value;
    const nome = document.getElementById('nome').value;
    const nota1 = parseFloat(document.getElementById('nota1').value);
    const nota2 = parseFloat(document.getElementById('nota2').value);
    const nota3 = parseFloat(document.getElementById('nota3').value);
    const nota4 = parseFloat(document.getElementById('nota4').value);

    if (!matricula || !nome || isNaN(nota1) || isNaN(nota2) || isNaN(nota3) || isNaN(nota4)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const media = (nota1 + nota2 + nota3 + nota4) / 4;
    let situacao;
    let notaRecuperacao = '';

    if (media >= 6) {
        situacao = 'Aprovado';
    } else {
        situacao = 'Reprovado';
        alunoEmRecuperacao = { matricula, nome, nota1, nota2, nota3, nota4 };
        mostrarMensagemRecuperacao();
    }
    
    const aluno = {
        matricula,
        nome,
        nota1,
        nota2,
        nota3,
        nota4,
        media,
        situacao,
        notaRecuperacao
    };

    let alunos = JSON.parse(localStorage.getItem('alunos')) || [];
    alunos.push(aluno);
    localStorage.setItem('alunos', JSON.stringify(alunos));

    if (situacao !== 'Reprovado') {
        alunoEmRecuperacao = null;
        document.getElementById('mensagemRecuperacao').classList.add('hidden');
    }

    exibirResultados();
    document.getElementById('form').reset();
}

function exibirResultados() {
    const tabela = document.getElementById('tabelaResultados').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';
    
    let alunos = JSON.parse(localStorage.getItem('alunos')) || [];
    
    alunos.forEach(aluno => {
        const linha = tabela.insertRow();
        
        linha.insertCell(0).textContent = aluno.matricula;
        linha.insertCell(1).textContent = aluno.nome;
        linha.insertCell(2).textContent = aluno.nota1;
        linha.insertCell(3).textContent = aluno.nota2;
        linha.insertCell(4).textContent = aluno.nota3;
        linha.insertCell(5).textContent = aluno.nota4;
        linha.insertCell(6).textContent = aluno.media.toFixed(1);
        linha.insertCell(7).textContent = aluno.situacao;
        linha.insertCell(8).textContent = aluno.notaRecuperacao;
        
        const acaoCell = linha.insertCell(9);
        const botaoExcluir = document.createElement('button');
        botaoExcluir.textContent = 'Excluir';
        botaoExcluir.className = 'excluir';
        botaoExcluir.onclick = () => excluirAluno(aluno.matricula);
        acaoCell.appendChild(botaoExcluir);
        
        const botaoEditar = document.createElement('button');
        botaoEditar.textContent = 'Editar';
        botaoEditar.className = 'editar';
        botaoEditar.onclick = () => iniciarEdicao(aluno.matricula);
        acaoCell.appendChild(botaoEditar);
    });
}

function mostrarMensagemRecuperacao() {
    document.getElementById('mensagemRecuperacao').classList.remove('hidden');
}

function adicionarNotaRecuperacao() {
    if (!alunoEmRecuperacao) {
        alert('Nenhum aluno está em recuperação.');
        return;
    }

    const novaNota = parseFloat(document.getElementById('notaRecuperacao').value);
    
    if (isNaN(novaNota) || novaNota < 0 || novaNota > 10) {
        alert('Nota inválida.');
        return;
    }

    let alunos = JSON.parse(localStorage.getItem('alunos')) || [];
    alunos = alunos.map(aluno => {
        if (aluno.matricula === alunoEmRecuperacao.matricula) {
            aluno.notaRecuperacao = novaNota;
            aluno.situacao = aluno.notaRecuperacao >= 6 ? 'Aprovado' : 'Reprovado';
        }
        return aluno;
    });
    
    localStorage.setItem('alunos', JSON.stringify(alunos));
    alunoEmRecuperacao = null;
    document.getElementById('mensagemRecuperacao').classList.add('hidden');
    exibirResultados();
}

function excluirAluno(matricula) {
    let alunos = JSON.parse(localStorage.getItem('alunos')) || [];
    alunos = alunos.filter(aluno => aluno.matricula !== matricula);
    localStorage.setItem('alunos', JSON.stringify(alunos));
    exibirResultados();
}

function iniciarEdicao(matricula) {
    alunoEditando = matricula;
    document.getElementById('formularioEdicao').classList.remove('hidden');
}

function salvarEdicao() {
    if (!alunoEditando) {
        alert('Nenhum aluno selecionado para edição.');
        return;
    }

    const coluna = document.getElementById('colunaEdicao').value;
    const novoValor = parseFloat(document.getElementById('novoValor').value);

    if (isNaN(novoValor) || novoValor < 0 || novoValor > 10) {
        alert('Valor inválido.');
        return;
    }

    let alunos = JSON.parse(localStorage.getItem('alunos')) || [];
    alunos = alunos.map(aluno => {
        if (aluno.matricula === alunoEditando) {
            aluno[coluna] = novoValor;

            // Recalcula a média se alguma das notas principais for editada
            if (coluna === 'nota1' || coluna === 'nota2' || coluna === 'nota3' || coluna === 'nota4') {
                aluno.media = (aluno.nota1 + aluno.nota2 + aluno.nota3 + aluno.nota4) / 4;
                aluno.situacao = aluno.media >= 6 ? 'Aprovado' : 'Recuperação';
            }

            // Se a nota de recuperação for editada, atualiza a situação
            if (coluna === 'notaRecuperacao') {
                aluno.notaRecuperacao = novoValor;
                if (aluno.notaRecuperacao >= 6) {
                    aluno.situacao = 'Aprovado';
                } else if (aluno.media < 6 && aluno.notaRecuperacao < 6) {
                    aluno.situacao = 'Reprovado';
                }
            }
        }
        return aluno;
    });

    localStorage.setItem('alunos', JSON.stringify(alunos));
    alunoEditando = null;
    document.getElementById('formularioEdicao').classList.add('hidden');
    exibirResultados();
}


function cancelarEdicao() {
    alunoEditando = null;
    document.getElementById('formularioEdicao').classList.add('hidden');
}

function filtrarResultados() {
    const busca = document.getElementById('barraBusca').value.toLowerCase();
    const tabela = document.getElementById('tabelaResultados').getElementsByTagName('tbody')[0];
    const linhas = tabela.getElementsByTagName('tr');

    Array.from(linhas).forEach(linha => {
        const matricula = linha.cells[0].textContent.toLowerCase();
        const nome = linha.cells[1].textContent.toLowerCase();
        if (matricula.includes(busca) || nome.includes(busca)) {
            linha.style.display = '';
        } else {
            linha.style.display = 'none';
        }
    });
}
