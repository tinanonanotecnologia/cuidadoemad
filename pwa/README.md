# Cuidado em AD · Baralhos — MVP

Primeira versão instalável no Android como PWA. O MVP inclui os 10 baralhos, todas as cartas extraídas dos PDFs em formato vertical, sorteio individual, reflexão e anotações salvas no próprio dispositivo.

## Testar no computador

Abra a pasta com um servidor local, por exemplo:

```bash
python -m http.server 8765
```

Depois acesse `http://localhost:8765`.

## Instalar no Android

Abra o endereço do aplicativo no Chrome do celular e escolha **Adicionar à tela inicial**. O app funciona em modo independente e continua disponível offline depois do primeiro carregamento dos arquivos principais.

## Próxima etapa

Conectar o desbloqueio dos baralhos à Kiwify e transformar a PWA em APK nativo, se necessário.
