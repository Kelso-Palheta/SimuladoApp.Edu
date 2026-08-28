"""
Tarefas Assíncronas do Celery (src/infraestrutura/tasks.py)
Processamento pesado em segundo plano para o Horário Escolar
"""
import time
from celery import shared_task
from typing import List, Dict, Any

from apps.horario_escolar_inteligente.dominio.algoritmo_alocacao import MotorAlocacaoBacktracking, RequisicaoAula
from apps.horario_escolar_inteligente.dominio.entidades import Professor, SalaTematica, GradeEscolar, Slot
from apps.horario_escolar_inteligente.dominio.servicos import ValidadorConflitos, CalculadorScorePedagogico, normalizar_texto
from apps.horario_escolar_inteligente.infraestrutura.models import EscolaModel, ProfessorModel, SalaTematicaModel, TurmaModel, MatrizCurricularModel, GradeModel, SlotGradeModel


@shared_task(bind=True, name="tasks.gerar_grade_otimizada")
def gerar_grade_otimizada_task(self, escola_id: int) -> Dict[str, Any]:
    """
    Executa a geração automatizada da grade escolar usando algoritmo de backtracking.
    """
    self.update_state(state="PROGRESS", meta={"etapa": "Carregando entidades do banco..."})

    try:
        escola = EscolaModel.objects.get(id=escola_id)
    except EscolaModel.DoesNotExist:
        return {"sucesso": False, "erro": "Escola não encontrada"}

    # Carregar professores e salas da escola
    profs_db = ProfessorModel.objects.filter(escola=escola)
    salas_db = SalaTematicaModel.objects.filter(escola=escola)
    turmas_db = TurmaModel.objects.filter(escola=escola)

    professores = {
        normalizar_texto(p.nome): Professor(
            nome=p.nome,
            area_bncc=p.area_bncc,
            dia_planejamento=p.dia_planejamento
        )
        for p in profs_db
    }

    salas = {
        normalizar_texto(s.nome): SalaTematica(
            nome=s.nome,
            area_bncc=s.area_bncc,
            tipologia=s.tipologia,
            capacidade=s.capacidade
        )
        for s in salas_db
    }

    # Montar lista de demandas de aulas a partir das matrizes curriculares
    demandas: List[RequisicaoAula] = []
    for turma in turmas_db:
        matrizes = MatrizCurricularModel.objects.filter(turma=turma)
        for m in matrizes:
            # Buscar professor vinculado (ou primeiro professor da área)
            prof_vinculado = profs_db.first()
            if prof_vinculado:
                for _ in range(m.carga_semanal):
                    demandas.append(RequisicaoAula(
                        turma_nome=turma.nome,
                        disciplina=m.disciplina,
                        professor_nome=prof_vinculado.nome,
                        area_bncc=prof_vinculado.area_bncc,
                        sala_sugerida=""
                    ))

    self.update_state(state="PROGRESS", meta={"etapa": "Executando algoritmo combinatório..."})

    motor = MotorAlocacaoBacktracking(professores=professores, salas=salas)
    grade_gerada = motor.gerar_grade(demandas)

    if not grade_gerada:
        return {
            "sucesso": False,
            "mensagem": "Não foi possível encontrar uma grade sem conflitos para as restrições fornecidas."
        }

    # Calcular score pedagógico
    validador = ValidadorConflitos()
    score_calc = CalculadorScorePedagogico()
    relatorio = validador.validar(grade_gerada)
    score_res = score_calc.calcular(grade_gerada)

    return {
        "sucesso": True,
        "total_slots": len(grade_gerada.slots),
        "conflitos": len(relatorio.conflitos_rigidos),
        "score_pedagogico": score_res.score,
        "slots": [
            {
                "turma": s.turma,
                "dia": s.dia,
                "aula": s.aula,
                "prof": s.prof,
                "disc": s.disc,
                "sala": s.sala
            }
            for s in grade_gerada.slots
        ]
    }


@shared_task(name="tasks.validar_grade_assincrona")
def validar_grade_assincrona_task(slots_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Executa auditoria pesada em segundo plano.
    """
    slots = [
        Slot(
            turma=s["turma"],
            dia=s["dia"],
            aula=int(s["aula"]),
            prof=s["prof"],
            disc=s.get("disc", ""),
            sala=s.get("sala", "")
        )
        for s in slots_data
    ]

    grade = GradeEscolar(slots=slots)
    validador = ValidadorConflitos()
    score_calc = CalculadorScorePedagogico()

    relatorio = validador.validar(grade)
    score_res = score_calc.calcular(grade)

    return {
        "valido": relatorio.valido,
        "total_slots": len(slots),
        "conflitos_rigidos": [c.model_dump() for c in relatorio.conflitos_rigidos],
        "score_pedagogico": score_res.score,
    }
