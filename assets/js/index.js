// MAX VALUES
const RPM_MAX = 100
const TEMPO_MAX = 100
const CMAGUA_MAX = 100
const TEMPAGUA_MAX = 100
// MIN VALUES
const RPM_MIN = 1
const TEMPO_MIN = 0
const CMAGUA_MIN = 0
const TEMPAGUA_MIN = 0
const STEPS_MIN = 10

window.onload = function() {
    let json_lavagem, lavagem_config_steps = Array(), count_steps = 1, inconsistencia;

    document.querySelector('#lavagem_centrifugar').onclick = function() {
        document.querySelector('#lavagem_drenar').setAttribute('checked', true)
    }

    document.querySelector('#botao_proximo_passo').onclick = function() {
        lavagem = get_inputs_elements();
        inconsistencia = verify_inconsistences(lavagem);

        if(inconsistencia.encontrada) {
            document.querySelector('#lavagem_inconsistencia_msg_container').style = 'display: block';
            document.querySelector('#lavagem_inconsistencia_msg').innerHTML = inconsistencia.mensagem;
            return false;
        } else
            document.querySelector('#lavagem_inconsistencia_msg_container').style = 'display: none';

        lavagem_config_steps.push(lavagem);
        
        // Limpar formulário
        document.querySelector('#lavagem_form').reset();

        count_steps++;
        document.querySelector('#lavagem_passo_atual').innerText = count_steps;
        if(count_steps >= STEPS_MIN) {
            document.querySelector('#botao_salvar_passos').style = 'display: block';
        }
    }

    document.querySelector('#botao_salvar_passos').onclick = function() {
        if(inconsistencia.encontrada) {
            document.querySelector('#lavagem_inconsistencia_msg_container').style = 'display: block';
            document.querySelector('#lavagem_inconsistencia_msg').innerHTML = inconsistencia.mensagem;
            return false;
        } else
            document.querySelector('#lavagem_inconsistencia_msg_container').style = 'display: none';

        lavagem_config_steps.push(lavagem);
        json_lavagem = JSON.stringify(lavagem_config_steps, null, '\t');

        // "Reset"
        count_steps = 1;
        document.querySelector('#lavagem_passo_atual').innerText = count_steps;
        document.querySelector('#botao_salvar_passos').style = 'display: none';

        // Mensagem de passos salvos
        document.querySelector('#lavagem_inconsistencia_msg_container').style = 'display: block; border: 2px solid limegreen;';
        document.querySelector('#lavagem_inconsistencia_msg').innerText = 'Programação de lavagem salva com sucesso';

        document.querySelector('#lavagem_form').reset();

        // Enviando arquivo JSON
    }
}

function verify_inconsistences(lavagem) {
    let inconsistencia = {
        encontrada  : false,
        mensagem    : ''
    };
    // Valores abaixo ou acima do permitido
    if(lavagem.rpm < RPM_MIN || lavagem.rpm > RPM_MAX) {
        inconsistencia.encontrada = true;
        inconsistencia.mensagem = 'Rotações por Minuto está muito baixa ou muito alta';
    }

    if(lavagem.tempo < TEMPO_MIN || lavagem.tempo > TEMPO_MAX) {
        inconsistencia.encontrada = true;
        inconsistencia.mensagem = 'Tempo de Lavagem está muito baixa ou muito alta';
    }

    if(lavagem.cmagua < CMAGUA_MIN || lavagem.cmagua > CMAGUA_MAX) {
        inconsistencia.encontrada = true;
        inconsistencia.mensagem = 'Centímetros de Água está muito baixa ou muito alta';
    }

    if(lavagem.tempagua < TEMPAGUA_MIN || lavagem.tempagua > TEMPAGUA_MAX) {
        inconsistencia.encontrada = true;
        inconsistencia.mensagem = 'Temperatura da água está muito baixa ou muito alta';
    }

    // Possíveis problemas de execução dos passos
    if(lavagem.centrifugar) { // Centrifugar
        if(!lavagem.dreno) {
            inconsistencia.encontrada = true;
            inconsistencia.mensagem = 'Não é possível centrifugar sem drenar';
        }
    }
    return inconsistencia;
}

function get_inputs_elements() {
    lavagem = {
        rpm         : document.querySelector('#lavagem_rpm').value,
        tempo       : document.querySelector('#lavagem_tempo').value,
        cmagua      : document.querySelector('#lavagem_cmagua').value,
        tempagua    : document.querySelector('#lavagem_tempagua').value,
        aguafria    : false,
        aguaquente  : false,
        aquecer     : false,
        lavar       : false,
        centrifugar : false,
        dreno       : false
    };

    if(document.querySelector('#lavagem_agua_fria').checked) // Água fria
        lavagem.aguafria = true;
    else // Água quente
        lavagem.aguaquente = true;

    if(document.querySelector('#lavagem_aquecer').checked) // Aquecer
        lavagem.aquecer = true;
    
    if(document.querySelector('#lavagem_lavar').checked) // Lavar
        lavagem.lavar = true;
    
    if(document.querySelector('#lavagem_centrifugar').checked) // Centrifugar
        lavagem.centrifugar = true;
    
    if(document.querySelector('#lavagem_drenar').checked) // Drenar
        lavagem.dreno = true
    return lavagem;
}