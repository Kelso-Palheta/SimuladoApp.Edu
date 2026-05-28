# Itinerários Formativos: como tratar no horário

## O que são

Os Itinerários Formativos (IF) são o componente do Novo Ensino Médio onde o aluno escolhe um caminho de aprofundamento. Tipos previstos pela legislação:

1. **Aprofundamento em uma das 4 áreas** da BNCC
2. **Aprofundamento integrando 2+ áreas**
3. **Formação Técnica e Profissional**

Em escola de tempo integral típica, os itinerários ocupam **30–40% da carga horária semanal** do aluno.

## Regra de ouro: itinerário usa as salas da sua área

Esta é a restrição central que diferencia esta skill de geradores genéricos:

> Quando um itinerário formativo está vinculado a uma área de conhecimento, suas aulas devem acontecer nas salas-ambiente daquela área.

Exemplos:

| Itinerário | Área vinculada | Salas que pode usar |
|---|---|---|
| Aprofundamento em Matemática | Matemática | Salas de Matemática (teórica), Lab. de Informática (quando matemática usa) |
| Investigação Científica | Ciências da Natureza | Salas teóricas de C.N., laboratórios de Biologia/Química/Física |
| Práticas em Letramento Linguístico | Linguagens | Salas de Linguagens, Lab. de Línguas |
| Núcleo de Estudos Sociais Aplicados | Ciências Humanas | Salas de Ciências Humanas |
| Eletiva integrada "Cidade e Cidadania" | Linguagens + C. Humanas | Pode rotacionar entre salas das duas áreas |

## Como modelar na estrutura de dados

Trate cada itinerário como uma "disciplina especial":

```json
{
  "turma": "1A",
  "disciplina": "Aprofundamento em Matemática",
  "tipo": "itinerario_formativo",
  "professor": "Carlos Souza",
  "area": "Matemática",
  "carga_semanal": 4,
  "tipo_sala_preferida": "teorica",
  "aulas_em_laboratorio": 1
}
```

O campo `area` é o que diz ao algoritmo onde alocar o itinerário.

## Componentes especiais (não-itinerários, mas similares)

Alguns componentes do tempo integral também precisam de tratamento especial:

- **Projeto de Vida** — geralmente em sala teórica de qualquer área, ou em sala dedicada se a escola tiver. Pode ser conduzido por professor de qualquer área.
- **Estudo Orientado / Tutoria** — em sala teórica, sem restrição de área. Conduzido pelo professor tutor da turma.
- **Acolhimento (1º tempo da segunda)** — em qualquer sala da turma, geralmente o tutor.

Para esses, no JSON de entrada, use `"area": "qualquer"` e o algoritmo aloca em qualquer sala teórica livre.

## Ordem de alocação recomendada

1. Disciplinas da FGB primeiro (têm carga maior e restrições mais rígidas)
2. Itinerários da área depois (encaixam nos slots restantes da área)
3. Projeto de Vida, Estudo Orientado por último (mais flexíveis)

Isso garante que as obrigatoriedades curriculares estão atendidas antes de tentar encaixar o que é mais flexível.

## Eletivas integradas (multi-área)

Quando uma eletiva integra duas áreas (ex.: "Matemática Financeira e Cidadania" = Matemática + C. Humanas):

- O professor titular determina a área "principal"
- As salas da área principal têm prioridade
- Em caso de impossibilidade, pode usar salas da área secundária

Sinalize esses casos no relatório final para o coordenador validar.
