const apiKey = 'AIzaSyCfLgVaFo5pj0mkgP1m4aBmDZEYrzzX_GU';


document.getElementById('fetchSubscribers').addEventListener('click', async () => {
    const channelName = document.getElementById('channelName').value;
  
    if (!channelName) {
      document.getElementById('output').innerText = 'Por favor, ingresa el nombre de un canal.';
      return;
    }
  
    try {
      // Obtener el ID del canal desde el nombre
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelName)}&key=${apiKey}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
  
      if (!searchData.items || searchData.items.length === 0) {
        document.getElementById('output').innerText = 'No se encontró ningún canal con ese nombre.';
        return;
      }
  
      const channelId = searchData.items[0].id.channelId;
  
      // Obtener estadísticas del canal
      const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
      const statsResponse = await fetch(statsUrl);
      const statsData = await statsResponse.json();
  
      if (statsData.items && statsData.items.length > 0) {
        const subscribers = statsData.items[0].statistics.subscriberCount;
        const views = statsData.items[0].statistics.viewCount;
  
        // Mostrar suscriptores y visualizaciones
        document.getElementById('subs').innerText = `Número de suscriptores: ${subscribers}`;
        document.getElementById('views').innerText = `Número de visualizaciones: ${views}`;
      }
  
      // Inicializar variables para el paginado
      let videos = [];
      let nextPageToken = '';
      do {
        const videosUrl = `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&maxResults=50&type=video&pageToken=${nextPageToken}&key=${apiKey}`;
        const videosResponse = await fetch(videosUrl);
        const videosData = await videosResponse.json();
  
        // Guardar IDs de videos
        const videoIds = videosData.items.map(video => video.id.videoId);
        videos = videos.concat(videoIds);
  
        // Actualizar el token de la siguiente página
        nextPageToken = videosData.nextPageToken;
      } while (nextPageToken);
  
      // Procesar estadísticas de los videos obtenidos
      let totalLikes = 0;
      let totalComments = 0;
  
      for (let i = 0; i < videos.length; i += 50) {
        // Dividir los IDs en grupos de 50
        const chunk = videos.slice(i, i + 50).join(',');
        const videosStatsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${chunk}&key=${apiKey}`;
        const statsResponse = await fetch(videosStatsUrl);
        const statsData = await statsResponse.json();
  
        statsData.items.forEach(video => {
          totalLikes += parseInt(video.statistics.likeCount || 0);
          totalComments += parseInt(video.statistics.commentCount || 0);
        });
      }
  
      // Mostrar resultados finales
      document.getElementById('likes').innerText = `Número total de likes: ${totalLikes}`;
      document.getElementById('comments').innerText = `Número total de comentarios: ${totalComments}`;
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('output').innerText = 'Ocurrió un error al obtener los datos.';
    }
  });

  const clientId = '126569545869-g7jdjkh3vmmc4g0acbv0862hat3i5l4m.apps.googleusercontent.com';
  const clientSecret = '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';
  const redirectUri = 'https://idiamer0707.github.io/PruebaAPIYouTube/';
  const scope = 'https://www.googleapis.com/auth/youtube';
  
  let accessToken = '';
  
  // Detectar si ya hay un token de acceso al cargar la página
  window.addEventListener('load', async () => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    accessToken = hashParams.get('access_token');
  
    if (accessToken) {
      document.getElementById('output2').innerText = 'Autenticación completada con éxito.';
  
      // Llamar automáticamente a la función para mostrar los datos del canal autenticado
      await fetchUserChannelData();
    } else {
      document.getElementById('output2').innerText = 'Por favor, inicia sesión para continuar.';
    }
  });
  
  // Función para redirigir a la autenticación OAuth cuando se presione el botón
  document.getElementById('loginButton').addEventListener('click', () => {
    startAuthFlow();
  });
  
  // Función para iniciar el flujo de autenticación OAuth
  function startAuthFlow() {
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=token`;
    window.location.href = authUrl;
  }
  
  // Obtener datos del canal asociado a la cuenta autenticada
  async function fetchUserChannelData() {
    try {
      const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true&access_token=${accessToken}`;
      const response = await fetch(url);
      const data = await response.json();
  
      if (!data.items || data.items.length === 0) {
        document.getElementById('output2').innerText = 'No se encontró ningún canal asociado a esta cuenta.';
        return;
      }
  
      const channel = data.items[0];
      const channelName = channel.snippet.title;
      const subscribers = channel.statistics.subscriberCount;
      const views = channel.statistics.viewCount;
  
      document.getElementById('subs2').innerText = `Número de suscriptores: ${subscribers}`;
      document.getElementById('views2').innerText = `Número de visualizaciones: ${views}`;
      document.getElementById('output2').innerText = `Canal autenticado: ${channelName}`;

      // Obtener todos los videos públicos del canal
    let videos = [];
    let nextPageToken = '';
    do {
      const videosUrl = `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&maxResults=50&type=video&pageToken=${nextPageToken}&access_token=${accessToken}`;
      const videosResponse = await fetch(videosUrl);
      const videosData = await videosResponse.json();

      if (videosData.items) {
        const videoIds = videosData.items.map(video => video.id.videoId);
        videos = videos.concat(videoIds);
      }

      nextPageToken = videosData.nextPageToken;
    } while (nextPageToken);

    // Obtener estadísticas de los videos públicos y privados
    let totalLikes = 0;
    let totalComments = 0;

    for (let i = 0; i < videos.length; i += 50) {
      const chunk = videos.slice(i, i + 50).join(',');
      const videosStatsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${chunk}&access_token=${accessToken}`;
      const statsResponse = await fetch(videosStatsUrl);
      const statsData = await statsResponse.json();

      if (statsData.items) {
        statsData.items.forEach(video => {
          totalLikes += parseInt(video.statistics.likeCount || 0);
          totalComments += parseInt(video.statistics.commentCount || 0);
        });
      }
    }

    // Mostrar el total de likes y comentarios
    document.getElementById('likes2').innerText = `Número total de likes: ${totalLikes}`;
    document.getElementById('comments2').innerText = `Número total de comentarios: ${totalComments}`;
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('output2').innerText = 'Ocurrió un error al obtener los datos del canal.';
    }
  }
