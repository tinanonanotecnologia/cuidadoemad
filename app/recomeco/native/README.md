# Camada nativa opcional

O app publicado em `/app/recomeco` é uma rota web. Esta pasta mantém a camada
Expo para quando o projeto nativo for compilado. O componente GlassMenu usa
expo-glass-effect somente na barra e nos botões do menu, com fallback para
View em plataformas sem suporte.
