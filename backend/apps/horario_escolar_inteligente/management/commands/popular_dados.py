"""
Comando de Gerenciamento: popular_dados (src/infraestrutura/management/commands/popular_dados.py)
Carga inicial de dados reais a partir do data.json para o banco de dados MySQL/SQLite
"""
import json
import os
from pathlib import Path
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.horario_escolar_inteligente.infraestrutura.models import (
    EscolaModel,
    TurmaModel,
    ProfessorModel,
    SalaTematicaModel,
    GradeModel,
    SlotGradeModel,
    ChangelogPermutaModel,
)
from apps.horario_escolar_inteligente.dominio.servicos import normalizar_texto


class Command(BaseCommand):
    help = "Popula o banco de dados com a grade escolar real a partir do data.json"

    def add_arguments(self, parser):
        parser.add_argument(
            "--arquivo",
            type=str,
            default="data.json",
            help="Caminho para o arquivo JSON de dados (padrão: data.json)",
        )

    def handle(self, *args, **options):
        caminho_arquivo = Path(options["arquivo"])
        if not caminho_arquivo.is_absolute():
            caminho_arquivo = Path(os.getcwd()) / caminho_arquivo

        if not caminho_arquivo.exists():
            self.stderr.write(self.style.ERROR(f"Arquivo não encontrado: {caminho_arquivo}"))
            return

        with open(caminho_arquivo, "r", encoding="utf-8") as f:
            data = json.load(f)

        slots_json = data.get("slots", [])
        meta_json = data.get("meta", {})
        salas_alocacao = data.get("salas_alocacao", {})

        self.stdout.write(self.style.MIGRATE_HEADING("Iniciando carga atômica de dados..."))

        with transaction.atomic():
            # 1. Escola
            nome_escola = meta_json.get("nome_escola", "Escola Estadual de Ensino Médio Integral")
            escola, created = EscolaModel.objects.get_or_create(
                nome=nome_escola,
                defaults={"codigo_mec": "15001234"}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Escola criada: {escola.nome}"))

            # 2. Mapeamento de Salas Temáticas & Áreas
            mapa_salas_db = {}
            for area, salas in salas_alocacao.items():
                for sala_nome in salas:
                    s_obj, _ = SalaTematicaModel.objects.get_or_create(
                        escola=escola,
                        nome=sala_nome,
                        defaults={"area_bncc": area, "tipologia": "Teórica"}
                    )
                    mapa_salas_db[normalizar_texto(sala_nome)] = s_obj

            # Salas adicionais encontradas nos slots
            for s in slots_json:
                s_nome = s.get("sala", "")
                if s_nome and normalizar_texto(s_nome) not in mapa_salas_db:
                    s_obj, _ = SalaTematicaModel.objects.get_or_create(
                        escola=escola,
                        nome=s_nome,
                        defaults={"area_bncc": "Especiais", "tipologia": "Especial"}
                    )
                    mapa_salas_db[normalizar_texto(s_nome)] = s_obj

            # 3. Mapeamento de Turmas
            turmas_unicas = sorted(list({s.get("turma") for s in slots_json if s.get("turma")}))
            mapa_turmas_db = {}
            for t_nome in turmas_unicas:
                t_obj, _ = TurmaModel.objects.get_or_create(
                    escola=escola,
                    nome=t_nome,
                    defaults={"serie": t_nome.split(" - ")[0] if " - " in t_nome else "Ensino Médio"}
                )
                mapa_turmas_db[t_nome] = t_obj

            # 4. Mapeamento de Professores
            profs_unicos = {}
            for s in slots_json:
                p_nome = s.get("prof")
                s_nome = s.get("sala")
                if p_nome:
                    area = "Linguagens"
                    if s_nome and normalizar_texto(s_nome) in mapa_salas_db:
                        area = mapa_salas_db[normalizar_texto(s_nome)].area_bncc
                    profs_unicos[p_nome] = area

            mapa_profs_db = {}
            for p_nome, area in profs_unicos.items():
                p_obj, _ = ProfessorModel.objects.get_or_create(
                    escola=escola,
                    nome=p_nome,
                    defaults={"area_bncc": area}
                )
                mapa_profs_db[normalizar_texto(p_nome)] = p_obj

            # 5. Criar Grade Ativa
            grade = GradeModel.objects.create(
                escola=escola,
                versao=meta_json.get("versao_grade", "2.0.0-PROD"),
                ativa=True
            )

            # 6. Criar Slots de Grade
            slots_a_criar = []
            for s in slots_json:
                t_obj = mapa_turmas_db.get(s.get("turma"))
                p_obj = mapa_profs_db.get(normalizar_texto(s.get("prof", "")))
                s_obj = mapa_salas_db.get(normalizar_texto(s.get("sala", "")))

                if t_obj and p_obj and s_obj:
                    slots_a_criar.append(
                        SlotGradeModel(
                            grade=grade,
                            dia=s.get("dia"),
                            aula=int(s.get("aula", 1)),
                            turma=t_obj,
                            professor=p_obj,
                            disciplina=s.get("disc", ""),
                            sala=s_obj
                        )
                    )

            SlotGradeModel.objects.bulk_create(slots_a_criar)

            # Changelog inicial
            ChangelogPermutaModel.objects.create(
                grade=grade,
                tipo_operacao="Carga Inicial",
                descricao=f"Carga inicial de {len(slots_a_criar)} slots a partir de {options['arquivo']}"
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Carga concluída: {len(turmas_unicas)} turmas, {len(mapa_profs_db)} professores, "
                f"{len(mapa_salas_db)} salas e {len(slots_a_criar)} slots importados com sucesso!"
            )
        )
