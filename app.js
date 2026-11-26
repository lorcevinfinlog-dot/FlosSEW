(() => {
  const canvas = document.getElementById('artboard');
  const ctx = canvas.getContext('2d');
  const $ = (id) => document.getElementById(id);
  const floxConfig=window.FLOXZERT_CONFIG||{};
  const cloudApiBase=typeof floxConfig.apiBase==='string'?floxConfig.apiBase.trim().replace(/\/+$/,''):'';
  const turnstileSiteKey=typeof floxConfig.turnstileSiteKey==='string'?floxConfig.turnstileSiteKey.trim():'';
  const nativeFetch=window.fetch.bind(window);
  window.fetch=(input,init={})=>{
    if(typeof input==='string'&&cloudApiBase&&/^\/api\/(auth(?:\/|$)|projects(?:\/|$)|preferences(?:\/|$))/.test(input)){
      const headers=new Headers(init.headers||{}),token=localStorage.getItem('floxzert-cloud-token');
      if(token)headers.set('Authorization',`Bearer ${token}`);
      return nativeFetch(`${cloudApiBase}${input}`,{...init,headers});
    }
    return nativeFetch(input,init)
  };
  const labels = {select:'Перемещение',brush:'Кисть',pencil:'Карандаш',eraser:'Ластик',fill:'Заливка',line:'Линия',rect:'Прямоугольник',roundrect:'Скруглённый прямоугольник',ellipse:'Эллипс',triangle:'Треугольник',polygon:'Многоугольник',star:'Звезда',text:'Текст',lasso:'Свободное лассо',magic:'Быстрое выделение',blur:'Размытие',eyedropper:'Пипетка'};
  const AI_MODELS={'flox-mini':['Flox Mini 0.1.0.1'],flox:['Flox 0.1.0.1'],floxzert:['Flox Mini 0.1.0.1'],gemini:['gemini-2.5-flash','gemini-2.5-pro'],openai:['gpt-4o-mini','gpt-4.1-mini','gpt-4o'],anthropic:['claude-haiku-4-5','claude-sonnet-4-5'],deepseek:['deepseek-chat','deepseek-reasoner'],custom:['custom']};
  const AI_PROVIDER_NAMES={'flox-mini':'Flox Mini',flox:'Flox',floxzert:'Flox Mini',gemini:'Gemini',openai:'OpenAI',anthropic:'Anthropic',deepseek:'DeepSeek',custom:'OpenAI-compatible'};
  const desktopLocalAI=window.floxDesktop?.isDesktop===true;
  const localDevelopmentHost=['localhost','127.0.0.1','::1'].includes(location.hostname);
  const shortcutDefaults = [
    {id:'save',title:'Сохранить проект',category:'Файл',keys:['Ctrl+S']},
    {id:'saveAs',title:'Сохранить копию .flosk (desktop)',category:'Файл',keys:['Ctrl+Shift+S']},
    {id:'open',title:'Импортировать файл или изображение',category:'Файл',keys:['Ctrl+O']},
    {id:'newProject',title:'Создать проект',category:'Файл',keys:['Ctrl+N']},
    {id:'undo',title:'Отменить',category:'Правка',keys:['Ctrl+Z']},
    {id:'redo',title:'Повторить',category:'Правка',keys:['Ctrl+Shift+Z','Ctrl+Y']},
    {id:'copy',title:'Копировать выделенное',category:'Правка',keys:['Ctrl+C']},
    {id:'cut',title:'Вырезать выделенное',category:'Правка',keys:['Ctrl+X']},
    {id:'paste',title:'Вставить',category:'Правка',keys:['Ctrl+V']},
    {id:'duplicate',title:'Дублировать со смещением',category:'Правка',keys:['Ctrl+D']},
    {id:'delete',title:'Удалить выделенное',category:'Правка',keys:['Delete','Backspace']},
    {id:'selectAll',title:'Выделить все объекты кадра',category:'Выделение',keys:['Ctrl+A']},
    {id:'deselect',title:'Снять выделение',category:'Выделение',keys:['Ctrl+Shift+A']},
    {id:'commandPalette',title:'Открыть командную палитру',category:'Окно',keys:['Ctrl+K']},
    {id:'settings',title:'Открыть настройки',category:'Окно',keys:['Ctrl+,']},
    {id:'help',title:'Справка по рабочим сочетаниям',category:'Окно',keys:['F1']},
    {id:'tool-select',title:'Перемещение / выделение',category:'Инструменты',keys:['V']},
    {id:'tool-brush',title:'Кисть',category:'Инструменты',keys:['B']},
    {id:'tool-pressure',title:'Кисть и переключить нажим',category:'Инструменты',keys:['Shift+B']},
    {id:'tool-pencil',title:'Карандаш',category:'Инструменты',keys:['N']},
    {id:'tool-eraser',title:'Ластик',category:'Инструменты',keys:['E']},
    {id:'tool-fill',title:'Заливка',category:'Инструменты',keys:['G']},
    {id:'tool-rect',title:'Прямоугольник',category:'Инструменты',keys:['R']},
    {id:'tool-roundrect',title:'Скругленный прямоугольник',category:'Инструменты',keys:['Shift+R']},
    {id:'tool-ellipse',title:'Эллипс',category:'Инструменты',keys:['O']},
    {id:'tool-line',title:'Линия',category:'Инструменты',keys:['L']},
    {id:'tool-triangle',title:'Треугольник',category:'Инструменты',keys:['Alt+Y']},
    {id:'tool-polygon',title:'Многоугольник',category:'Инструменты',keys:['Y']},
    {id:'tool-star',title:'Звезда',category:'Инструменты',keys:['Shift+Y']},
    {id:'tool-text',title:'Текст',category:'Инструменты',keys:['T']},
    {id:'tool-lasso',title:'Свободное лассо',category:'Инструменты',keys:['S']},
    {id:'tool-eyedropper',title:'Пипетка',category:'Инструменты',keys:['I']},
    {id:'opacity-10',title:'Непрозрачность объекта 10%',category:'Свойства',keys:['1']},
    {id:'opacity-20',title:'Непрозрачность объекта 20%',category:'Свойства',keys:['2']},
    {id:'opacity-30',title:'Непрозрачность объекта 30%',category:'Свойства',keys:['3']},
    {id:'opacity-40',title:'Непрозрачность объекта 40%',category:'Свойства',keys:['4']},
    {id:'opacity-50',title:'Непрозрачность объекта 50%',category:'Свойства',keys:['5']},
    {id:'opacity-60',title:'Непрозрачность объекта 60%',category:'Свойства',keys:['6']},
    {id:'opacity-70',title:'Непрозрачность объекта 70%',category:'Свойства',keys:['7']},
    {id:'opacity-80',title:'Непрозрачность объекта 80%',category:'Свойства',keys:['8']},
    {id:'opacity-90',title:'Непрозрачность объекта 90%',category:'Свойства',keys:['9']},
    {id:'opacity-100',title:'Непрозрачность объекта 100%',category:'Свойства',keys:['0']},
    {id:'zoom-fit',title:'Вписать холст в экран',category:'Вид',keys:['Ctrl+0']},
    {id:'zoom-actual',title:'Масштаб 100%',category:'Вид',keys:['Ctrl+Alt+1']},
    {id:'zoom-in',title:'Увеличить холст',category:'Вид',keys:['Ctrl+Alt+2']},
    {id:'zoom-out',title:'Уменьшить холст',category:'Вид',keys:['Ctrl+Alt+3']},
    {id:'grid-toggle',title:'Показать / скрыть сетку',category:'Вид',keys:['Ctrl+Shift+G']},
    {id:'addFrame',title:'Добавить кадр с копией текущего',category:'Анимация',keys:['F5']},
    {id:'copyFrame',title:'Копировать кадр в следующий',category:'Анимация',keys:['F6']},
    {id:'prevFrame',title:'Предыдущий кадр',category:'Анимация',keys:[',']},
    {id:'nextFrame',title:'Следующий кадр',category:'Анимация',keys:['.']},
    {id:'firstFrame',title:'Перейти к первому кадру',category:'Анимация',keys:['Home']},
    {id:'lastFrame',title:'Перейти к последнему кадру',category:'Анимация',keys:['End']},
    {id:'addKeyframe',title:'Добавить ключевой кадр активного слоя',category:'Анимация',keys:['K']},
    {id:'addBlankKeyframe',title:'Добавить пустой ключевой кадр активного слоя',category:'Анимация',keys:['Ctrl+Shift+K']},
    {id:'clearLayerFrame',title:'Очистить кадр активного слоя',category:'Анимация',keys:['Ctrl+Alt+Shift+K']},
    {id:'frameMarker',title:'Добавить маркер кадра',category:'Анимация',keys:['Ctrl+Alt+,']},
    {id:'toggleLoop',title:'Включить / выключить зацикливание',category:'Анимация',keys:['Ctrl+Alt+L']},
    {id:'play',title:'Воспроизвести / пауза',category:'Анимация',keys:['Space']},
    {id:'onion',title:'Переключить onion skin',category:'Анимация',keys:['Shift+O']},
    {id:'addLayer',title:'Добавить слой',category:'Слои',keys:['Ctrl+Shift+N']},
    {id:'toggleLayerLock',title:'Заблокировать / разблокировать активный слой',category:'Слои',keys:['Ctrl+Alt+Shift+L']},
    {id:'rotateLeft',title:'Повернуть выделенное влево на 15°',category:'Трансформация',keys:['Alt+[']},
    {id:'rotateRight',title:'Повернуть выделенное вправо на 15°',category:'Трансформация',keys:['Alt+]']},
    {id:'fill',title:'Включить / выключить заливку выделенного или по умолчанию',category:'Фигура',keys:['Shift+F']},
    {id:'removeFill',title:'Удалить заливку у выделенного',category:'Фигура',keys:['Alt+F','Shift+Delete']},
    {id:'toggleStroke',title:'Включить / выключить обводку',category:'Фигура',keys:['Shift+K']},
    {id:'removeStroke',title:'Убрать обводку у выделенного',category:'Фигура',keys:['Alt+K']}
  ];
  const MAX_SHORTCUTS_PER_ACTION=1000, MAX_SHORTCUT_BINDINGS=1000;
  const SYSTEM_SHORTCUT_IDS=new Set(['save','saveAs','open','newProject','undo','redo','copy','cut','paste','delete','selectAll','deselect','help']);
  const SHORTCUT_MODES=['press','hold','double','long'];
  const SHORTCUT_CONTEXTS=['global','canvas','timeline','assistant'];
  let activeShortcutContext='global', pendingShortcutHolds=new Map(), lastShortcutPresses=new Map();
  let tool = 'select', zoom = 1, drawing = false, start = null, preview = null, movingObject = null, moveLast = null, movingDirty = false, selectedId = null, currentFrame = 1, frameCount = 12, playing = false, onion = false;
  let spacePanning=false,panState=null,panOffset={x:0,y:0};
  let marquee = null, lassoSelection = null, transformState = null, blurStroke = null;
  let layers = [{id:'layer-1',name:'Эскиз',visible:true,locked:false,opacity:100},{id:'layer-2',name:'Персонаж',visible:true,locked:false,opacity:100},{id:'layer-3',name:'Фон',visible:true,locked:false,opacity:100}], draggedLayerId=null;
  let layerOpacityById = new Map(layers.map(layer=>[layer.id,layer.opacity]));
  let activeLayer = 'layer-2', objects = [], history = [], redoStack = [], assets = [], imageCache = new Map(), selectedIds = new Set(), clipboard = [];
  let frameStates = {}, settings = {curve_smoothing:'off',smoothing_sensitivity:50,smoothing_jitter_threshold:6,features:{},shortcuts:{},shortcut_enabled:{},shortcut_options:{},timeline_fps:12,onion_mode:'off',onion_frames:2,loop_enabled:true,loop_start:1,loop_end:12,playback_speed:1,tween_easing:'linear',motion_tween_duration:12,frame_markers:{},blank_keyframes:{},default_fill_enabled:true,fill_gradient_enabled:false,fill_gradient_type:'linear',fill_gradient_angle:0,fill_gradient_stops:[{offset:0,color:'#f0a36b'},{offset:100,color:'#e05d8a'}],frame_quality_scale:1,brush_size:8,blur_radius:8,stroke_color:'#f0a36b',fill_color:'#f0a36b',shadow_color:'#20202a',shadow_enabled:false}, recordingShortcut = null, paletteIndex = 0;
  Object.assign(settings,{background_color:'#fbfaf7',grid_enabled:false,grid_size:100,grid_snap_enabled:false,preview_quality:'balanced',curve_smoothing_enabled:false});
  let currentProjectId = null, projectRevision = 0, apiReady = false, saveTimer = null, saveInFlight = false, savePending = false, projectDirty = false, saveBlocked = false;
  let multiplayerUserId = null;
  const strokeColor = $('strokeColor'), fillColor = $('fillColor');
  const colorIn = (hex) => {const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${(n>>8)&255},${n&255},1)`};
  const layerRenderCache=new Map(),frameObjectsCache=new Map(),blurredObjectCache=new Map(),MAX_LAYER_CACHE_BYTES=160*1024*1024,MAX_BLURRED_OBJECT_CACHE_BYTES=96*1024*1024;
  let layerRenderCacheBytes=0,blurredObjectCacheBytes=0,layerRenderBuffer=null,pendingCanvasRender=null;
  function clearRenderCaches(){layerRenderCache.clear();frameObjectsCache.clear();layerRenderCacheBytes=0}
  function canReuseSceneCaches(){return !transformState&&!movingObject&&!objectOpacityEditing&&!strokeWidthEditing&&!cornerRadiusEditing&&!colorEditControl&&!layerOpacityEditing}
  function canCacheFrameLayers(frameCountToCache=1){
    const visibleLayers=layers.filter(layer=>layer.visible).length;
    return canvas.width*canvas.height*4*visibleLayers*frameCountToCache<=MAX_LAYER_CACHE_BYTES
  }
  function canCacheOnionLayers(){
    const ghostFrames=Math.min(Math.max(0,frameCount-1),Math.max(1,Number(settings.onion_frames)||2)*2);
    return canCacheFrameLayers(ghostFrames+1)
  }
  function scheduleRender(){
    if(pendingCanvasRender!==null)return;
    pendingCanvasRender=requestAnimationFrame(()=>{pendingCanvasRender=null;render(false)})
  }
  function getLayerRenderBuffer(){
    if(!layerRenderBuffer)layerRenderBuffer=document.createElement('canvas');
    if(layerRenderBuffer.width!==canvas.width||layerRenderBuffer.height!==canvas.height){layerRenderBuffer.width=canvas.width;layerRenderBuffer.height=canvas.height}
    return layerRenderBuffer
  }
  function drawLayerContents(targetCtx,items,ghost,ghostMode,ghostOpacity,ghostColor){
    for(const item of items){
      if(item.isEraser||item.type==='eraser'){if(!ghost)drawEraserStroke(targetCtx,item)}
      else drawShape(targetCtx,item,ghost,ghostMode,ghostOpacity,ghostColor)
    }
  }
  function getLayerBitmap(frame,layerId,items,ghost,ghostMode,ghostOpacity,ghostColor){
    const opacity=Number(layerOpacityById.get(layerId)??100);
    const key=[frame,layerId,ghost?1:0,ghostMode,ghostOpacity,ghostColor,opacity,canvas.width,canvas.height].join('|');
    const ids=items.map(item=>item.id);
    let cached=layerRenderCache.get(key);
    if(cached&&cached.objectIds.length===ids.length&&cached.objectIds.every((id,index)=>id===ids[index])){
      layerRenderCache.delete(key);layerRenderCache.set(key,cached);return cached.canvas
    }
    if(cached){layerRenderCacheBytes-=cached.bytes;layerRenderCache.delete(key)}
    const bytes=canvas.width*canvas.height*4;
    while(layerRenderCache.size&&layerRenderCacheBytes+bytes>MAX_LAYER_CACHE_BYTES){
      const oldestKey=layerRenderCache.keys().next().value,oldest=layerRenderCache.get(oldestKey);
      layerRenderCache.delete(oldestKey);layerRenderCacheBytes-=oldest.bytes
    }
    const layerCanvas=document.createElement('canvas');layerCanvas.width=canvas.width;layerCanvas.height=canvas.height;
    drawLayerContents(layerCanvas.getContext('2d'),items,ghost,ghostMode,ghostOpacity,ghostColor);
    layerRenderCache.set(key,{canvas:layerCanvas,objectIds:ids,bytes});
    layerRenderCacheBytes+=bytes;
    return layerCanvas
  }
  function getBlurredObjectBitmap(object,effects,bounds,padding){
    const localPosition=value=>Math.round(value*16)/16;
    const pointBased=['stroke','blur','eraser'].includes(object.type);
    const localObject={...object,x:pointBased?0:localPosition(object.x-bounds.x),y:pointBased?0:localPosition(object.y-bounds.y),blurEffects:undefined};
    if(pointBased){delete localObject.x2;delete localObject.y2}
    else{
      if(object.x2!==undefined)localObject.x2=localPosition(object.x2-bounds.x);
      if(object.y2!==undefined)localObject.y2=localPosition(object.y2-bounds.y)
    }
    if(Array.isArray(object.points))localObject.points=object.points.map(point=>({...point,x:localPosition(point.x-bounds.x),y:localPosition(point.y-bounds.y)}));
    delete localObject.id;delete localObject.frame;delete localObject.generatedTween;delete localObject.locked;
    const localEffects=effects.map(effect=>({
      radius:Math.max(1,Math.min(80,Number(effect.radius)||8)),
      size:Math.max(1,Math.min(80,Number(effect.size)||8)),
      strokes:effect.strokes.filter(points=>Array.isArray(points)&&points.length).map(points=>points.map(point=>({x:localPosition(point.x-bounds.x),y:localPosition(point.y-bounds.y)})))
    }));
    const image=object.type==='image'?imageCache.get(object.src):null;
    const key=JSON.stringify([localObject,localEffects,layerOpacityById.get(object.layer)??100,settings.shadow_color||'#20202a',document.fonts?.status||'',image?.complete?image.naturalWidth||0:0]);
    let cached=blurredObjectCache.get(key);
    if(cached){blurredObjectCache.delete(key);blurredObjectCache.set(key,cached);return cached.canvas}
    const width=Math.max(1,Math.ceil(bounds.w+padding*2)),height=Math.max(1,Math.ceil(bounds.h+padding*2));
    const objectCanvas=document.createElement('canvas');objectCanvas.width=width;objectCanvas.height=height;
    const objectContext=objectCanvas.getContext('2d');objectContext.translate(padding,padding);
    drawShapeBase(objectContext,localObject);
    objectContext.setTransform(1,0,0,1,0,0);
    for(const effect of localEffects){
      const blurredCanvas=document.createElement('canvas');blurredCanvas.width=width;blurredCanvas.height=height;
      const blurredContext=blurredCanvas.getContext('2d');blurredContext.filter=`blur(${effect.radius}px)`;blurredContext.drawImage(objectCanvas,0,0);
      const maskCanvas=document.createElement('canvas');maskCanvas.width=width;maskCanvas.height=height;
      const maskContext=maskCanvas.getContext('2d');maskContext.translate(padding,padding);maskContext.beginPath();
      effect.strokes.forEach(points=>{
        maskContext.moveTo(points[0].x,points[0].y);points.slice(1).forEach(point=>maskContext.lineTo(point.x,point.y));
        if(points.length===1)maskContext.lineTo(points[0].x+.01,points[0].y+.01)
      });
      maskContext.strokeStyle='#fff';maskContext.shadowColor='#fff';maskContext.shadowBlur=Math.max(2,Math.min(12,effect.size*.25));maskContext.lineWidth=effect.size;maskContext.lineCap='round';maskContext.lineJoin='round';maskContext.stroke();
      blurredContext.globalCompositeOperation='destination-in';blurredContext.drawImage(maskCanvas,0,0);
      objectContext.globalCompositeOperation='destination-out';objectContext.drawImage(maskCanvas,0,0);
      objectContext.globalCompositeOperation='source-over';objectContext.drawImage(blurredCanvas,0,0)
    }
    const bytes=width*height*4;
    while(blurredObjectCache.size&&blurredObjectCacheBytes+bytes>MAX_BLURRED_OBJECT_CACHE_BYTES){
      const oldestKey=blurredObjectCache.keys().next().value,oldest=blurredObjectCache.get(oldestKey);
      blurredObjectCache.delete(oldestKey);blurredObjectCacheBytes-=oldest.bytes
    }
    blurredObjectCache.set(key,{canvas:objectCanvas,bytes});blurredObjectCacheBytes+=bytes;
    return objectCanvas
  }
  function syncTimelineControls(){
    settings.timeline_fps=Math.max(1,Math.min(60,Number(settings.timeline_fps)||12));
    settings.onion_frames=Math.max(1,Math.min(12,Number(settings.onion_frames)||2));
    settings.loop_start=Math.max(1,Math.min(frameCount,Number(settings.loop_start)||1));
    settings.loop_end=Math.max(settings.loop_start,Math.min(frameCount,Number(settings.loop_end)||frameCount));
    settings.playback_speed=[.25,.5,1,1.5,2].includes(Number(settings.playback_speed))?Number(settings.playback_speed):1;
    $('timelineFps').value=settings.timeline_fps;
    $('onionMode').value=settings.onion_mode||'off';
    $('onionFrames').value=settings.onion_frames;
    $('loopEnabled').checked=settings.loop_enabled!==false;
    $('loopStart').value=settings.loop_start;
    $('loopEnd').value=settings.loop_end;
    $('playbackSpeed').value=String(settings.playback_speed);
    $('tweenEasing').value=settings.tween_easing||'linear';
    settings.motion_tween_duration=Math.max(2,Math.min(500,Number(settings.motion_tween_duration)||12));
    $('tweenDuration').value=settings.motion_tween_duration;
    $('gradientEnabled').checked=settings.fill_gradient_enabled===true;
    $('gradientType').value=settings.fill_gradient_type==='radial'?'radial':'linear';
    $('gradientAngle').value=settings.fill_gradient_angle??0;
    renderGradientStops();
    onion=settings.onion_mode!=='off';
    $('onionButton').classList.toggle('enabled',onion);
  }
  function snapshot(){clearRenderCaches();history.push(JSON.stringify({objects,frameStates,frameCount,currentFrame,layers,settings}));if(history.length>60)history.shift();redoStack=[]}
  function projectData(){return {format:'FLOSK',format_version:1,schema_version:1,name:$('projectSwitcher').childNodes[0].textContent.trim(),width:canvas.width,height:canvas.height,fps:Number(settings.timeline_fps)||12,background:settings.background_color||'#fbfaf7',objects,layers,assets,frame_count:frameCount,frame_states:frameStates,settings}}
  function normalizeProjectFile(parsed){
    if(!parsed||typeof parsed!=='object')throw new Error('Файл проекта не является объектом JSON');
    let data;
    if(parsed.format==='FLOSK'){
      if(parsed.format_version!==1)throw new Error(`Неподдерживаемая версия FLOSK: ${parsed.format_version}`);
      data=parsed.project;
    }else if(parsed.format||parsed.format_version){
      throw new Error('Неизвестный формат FloxZert');
    }else data=parsed;
    if(!data||typeof data!=='object'||data.schema_version!==1)throw new Error('Неверная или неподдерживаемая схема проекта');
    if(!Array.isArray(data.objects)||!Array.isArray(data.layers))throw new Error('В проекте отсутствуют слои или объекты');
    if(!Number.isFinite(Number(data.width))||!Number.isFinite(Number(data.height)))throw new Error('Некорректный размер холста');
    return migrateLegacyCanvas(data);
  }
  function normalizeGradientStops(stops){
    if(!Array.isArray(stops))return [{offset:0,color:'#f0a36b'},{offset:100,color:'#e05d8a'}];
    const valid=stops.filter(stop=>stop&&Number.isFinite(Number(stop.offset))&&/^#[0-9a-f]{6}$/i.test(stop.color||'')).slice(0,16)
      .map(stop=>({offset:Math.max(0,Math.min(100,Number(stop.offset))),color:stop.color})).sort((a,b)=>a.offset-b.offset);
    return valid.length>=2?valid:[{offset:0,color:'#f0a36b'},{offset:100,color:'#e05d8a'}]
  }
  function validGradient(gradient){
    return gradient&&['linear','radial'].includes(gradient.type)&&Array.isArray(gradient.stops)&&gradient.stops.length>=2&&gradient.stops.length<=16&&
      (gradient.type==='radial'||(Number.isFinite(Number(gradient.angle))&&Math.abs(Number(gradient.angle))<=360))&&
      gradient.stops.every(stop=>stop&&Number.isFinite(Number(stop.offset))&&Number(stop.offset)>=0&&Number(stop.offset)<=100&&/^#[0-9a-f]{6}$/i.test(stop.color||''))
  }
  function applyProjectData(data){
    clearRenderCaches();
    objects=data.objects||[];
    objects.forEach(object=>{if(object.filter==='blur(5px)')delete object.filter});
    frameStates=data.frame_states||{};
    layers=(data.layers||layers).map(layer=>({...layer,opacity:layer.opacity??100}));
    assets=data.assets||[];
    frameCount=data.frame_count||12;
    settings={...settings,...(data.settings||{})};
    if(!data.settings?.timeline_fps&&data.fps)settings.timeline_fps=data.fps;
    settings.grid_size=[50,100,200,400].includes(Number(settings.grid_size))?Number(settings.grid_size):100;
    settings.frame_quality_scale=[1,2,3,4].includes(Number(settings.frame_quality_scale))?Number(settings.frame_quality_scale):1;
    settings.brush_size=Math.max(1,Math.min(80,Number(settings.brush_size)||8));
    settings.blur_radius=Math.max(1,Math.min(80,Number(settings.blur_radius)||8));
    settings.features=settings.features||{};
    settings.shortcuts=settings.shortcuts&&typeof settings.shortcuts==='object'&&!Array.isArray(settings.shortcuts)?settings.shortcuts:{};
    settings.shortcut_enabled=settings.shortcut_enabled&&typeof settings.shortcut_enabled==='object'&&!Array.isArray(settings.shortcut_enabled)?settings.shortcut_enabled:{};
    settings.shortcut_options=settings.shortcut_options&&typeof settings.shortcut_options==='object'&&!Array.isArray(settings.shortcut_options)?settings.shortcut_options:{};
    settings.frame_markers=settings.frame_markers||{};
    settings.blank_keyframes=settings.blank_keyframes||{};
    settings.fill_gradient_stops=normalizeGradientStops(settings.fill_gradient_stops);
    settings.fill_gradient_type=settings.fill_gradient_type==='radial'?'radial':'linear';
    settings.fill_gradient_angle=Math.max(-360,Math.min(360,Number(settings.fill_gradient_angle)||0));
    settings.curve_smoothing=['off','manual','light','strong','geometry','curves','straight','auto','flox_ai'].includes(settings.curve_smoothing)?settings.curve_smoothing:'off';
    settings.smoothing_sensitivity=Math.max(0,Math.min(100,Number(settings.smoothing_sensitivity)||0));
    settings.smoothing_jitter_threshold=Math.max(1,Math.min(30,Number(settings.smoothing_jitter_threshold)||6));
    settings.motion_tween_duration=Math.max(2,Math.min(500,Number(settings.motion_tween_duration)||12));
    settings.loop_end=Math.min(frameCount,Number(settings.loop_end)||frameCount);
    settings.loop_start=Math.min(settings.loop_end,Math.max(1,Number(settings.loop_start)||1));
    selectedIds.clear();
    selectedId=null;
    activeLayer=layers.find(layer=>!layer.locked)?.id||layers[0]?.id||'';
    $('projectSwitcher').childNodes[0].textContent=data.name||'Новый проект';
    $('documentProjectName').textContent=data.name||'Новый проект';
    $('smoothingMode').value=settings.curve_smoothing;
    $('smoothingSensitivity').value=settings.smoothing_sensitivity;
    $('smoothingSensitivityValue').textContent=`${settings.smoothing_sensitivity}%`;
    $('smoothingJitter').value=settings.smoothing_jitter_threshold;
    $('smoothingJitterValue').textContent=`${settings.smoothing_jitter_threshold} px`;
    syncTimelineControls();
    document.querySelectorAll('[data-feature]').forEach(input=>input.checked=Boolean(settings.features[input.dataset.feature]));
    renderShortcutList()
  }
  function updateSaveStatus(text,kind=''){
    const el=$('saveStatus');
    el.className=`save-status ${kind}`.trim();
    el.lastChild.textContent=` ${text}`;
    $('storageStatus').textContent=apiReady?(cloudApiBase?'Облако · синхронизация':'Python · SQLite · версии включены'):'Браузер · сохранение на устройстве'
  }
  function save(){projectDirty=true;try{localStorage.setItem('floxzert-project',JSON.stringify(projectData()));if(currentProjectId)localStorage.setItem('floxzert-project-id',currentProjectId)}catch(e){console.error('Local project cache could not be saved',e);updateSaveStatus('Локальное сохранение недоступно','error')}if(!apiReady)return;if(saveBlocked){updateSaveStatus('Сохранение приостановлено — проверьте конфликт','error');return}clearTimeout(saveTimer);updateSaveStatus('Есть несохранённые изменения','saving');saveTimer=setTimeout(persistProject,400)}
  async function persistProject(){if(!apiReady||!currentProjectId||!projectDirty||saveBlocked)return;if(saveInFlight){savePending=true;return}saveInFlight=true;savePending=false;projectDirty=false;const snapshot=projectData();try{const response=await fetch(`/api/projects/${encodeURIComponent(currentProjectId)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:snapshot,expected_revision:projectRevision})});const result=await response.json();if(response.status===409){projectDirty=true;saveBlocked=true;updateSaveStatus('Конфликт версий — сохранение остановлено','error');console.error('Project revision conflict',result);return}if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);projectRevision=result.revision;updateSaveStatus('Все изменения сохранены')}catch(error){projectDirty=true;saveBlocked=true;updateSaveStatus('Ошибка сервера — данные в этом браузере','error');console.error('Project save failed',error)}finally{saveInFlight=false;if(savePending&&!saveBlocked){savePending=false;saveTimer=setTimeout(persistProject,100)}}}
  async function flushSave(){clearTimeout(saveTimer);while(saveInFlight)await new Promise(resolve=>setTimeout(resolve,25));if(saveBlocked)throw new Error('Сохранение заблокировано из-за конфликта или ошибки сервера');if(apiReady&&projectDirty)await persistProject();while(saveInFlight)await new Promise(resolve=>setTimeout(resolve,25));if(saveBlocked)throw new Error('Сохранение заблокировано из-за конфликта или ошибки сервера');if(apiReady&&projectDirty)await flushSave()}
  function load(){try{const p=JSON.parse(localStorage.getItem('floxzert-project')||'null');if(p)applyProjectData({...p,frame_count:p.frame_count||p.frameCount})}catch(e){console.error('Local project cache could not be loaded',e)}}
  function migrateLegacyCanvas(data){if(Number.isInteger(data.width))return data;const migrated=JSON.parse(JSON.stringify(data));for(const object of migrated.objects||[]){for(const key of ['x','y','x2','y2','width','textSize'])if(typeof object[key]==='number')object[key]*=2;for(const point of object.points||[]){point.x*=2;point.y*=2}}migrated.width=canvas.width;migrated.height=canvas.height;return migrated}
  async function initializeProjectStorage(){
    load();
    if(!cloudApiBase&&!desktopLocalAI&&!localDevelopmentHost){
      updateSaveStatus('Браузерный режим · проект хранится на этом устройстве');
      renderLayers();renderTimeline();render();
      return false;
    }
    try{
      const response=await fetch('/api/projects');
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const list=await response.json();
      const savedId=localStorage.getItem('floxzert-project-id');
      const selected=list.projects.find(project=>project.id===savedId)
        ||list.projects.find(project=>project.id===list.current_project_id)
        ||list.projects[0];
      if(!selected)throw new Error('Server returned no projects');
      const projectResponse=await fetch(`/api/projects/${encodeURIComponent(selected.id)}`);
      if(!projectResponse.ok)throw new Error(`HTTP ${projectResponse.status}`);
      const project=await projectResponse.json();
      const local=JSON.parse(localStorage.getItem('floxzert-project')||'null');
      const localData=local&&Array.isArray(local.objects)
        ?migrateLegacyCanvas({...projectData(),...local,name:local.name||project.data.name,frame_count:local.frame_count||local.frameCount||project.data.frame_count})
        :null;
      currentProjectId=project.id;
      projectRevision=project.revision;
      projectDirty=false;
      saveBlocked=false;
      if(localData&&!project.data.objects.length){
        applyProjectData(localData);
        apiReady=true;
        projectDirty=true;
        await persistProject();
        if(saveBlocked||projectDirty)throw new Error('Local project could not be uploaded safely');
      }else if(cloudApiBase&&localData?.objects.length&&!list.projects.some(item=>item.id===savedId)){
        const importResponse=await fetch('/api/projects/import',{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({data:localData})
        });
        const imported=await importResponse.json();
        if(!importResponse.ok)throw new Error(imported.error||`HTTP ${importResponse.status}`);
        currentProjectId=imported.id;
        projectRevision=imported.revision;
        applyProjectData(imported.data);
        apiReady=true;
        localStorage.setItem('floxzert-project-id',currentProjectId);
        localStorage.setItem('floxzert-project',JSON.stringify(projectData()));
      }else{
        applyProjectData(project.data);
        apiReady=true;
        localStorage.setItem('floxzert-project-id',currentProjectId);
        localStorage.setItem('floxzert-project',JSON.stringify(projectData()));
      }
      updateSaveStatus('Все изменения сохранены');
      renderLayers();renderTimeline();render();
      return true;
    }catch(error){
      apiReady=false;
      console.warn('Project storage unavailable; keeping the local browser copy',error);
      updateSaveStatus(cloudApiBase?'Облако недоступно · данные в браузере':'Браузерный режим · сохранение на этом устройстве');
      renderLayers();renderTimeline();render();
      return false;
    }
  }
  function point(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}
  function snapPoint(p){if(!settings.grid_snap_enabled)return p;const step=Math.max(10,Number(settings.grid_size)||100);return {x:Math.round(p.x/step)*step,y:Math.round(p.y/step)*step}}
  function drawGrid(){
    if(!settings.grid_enabled)return;
    const step=Math.max(10,Number(settings.grid_size)||100),majorStep=step*5;
    ctx.save();ctx.lineWidth=1;
    for(let x=0;x<=canvas.width;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.strokeStyle=x%majorStep===0?'rgba(25,65,112,.72)':'rgba(25,65,112,.38)';ctx.stroke()}
    for(let y=0;y<=canvas.height;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.strokeStyle=y%majorStep===0?'rgba(25,65,112,.72)':'rgba(25,65,112,.38)';ctx.stroke()}
    ctx.restore()
  }
  function applyPreviewQuality(){
    const quality=settings.preview_quality||'balanced';
    ctx.imageSmoothingEnabled=quality!=='draft';ctx.imageSmoothingQuality=quality==='high'?'high':quality==='draft'?'low':'medium';
    canvas.style.imageRendering=quality==='draft'?'pixelated':'auto';
  }
  function currentObjects(frame=currentFrame){
    const canCache=canReuseSceneCaches(),cacheKey=`${frame}|${settings.tween_easing||'linear'}`;
    if(canCache&&frameObjectsCache.has(cacheKey)){
      const cached=frameObjectsCache.get(cacheKey);frameObjectsCache.delete(cacheKey);frameObjectsCache.set(cacheKey,cached);return cached
    }
    const visibleLayers=new Set(layers.filter(layer=>layer.visible).map(layer=>layer.id));
    const atFrame=objects.filter(o=>o.frame===frame&&visibleLayers.has(o.layer));
    const keyedTracks=new Set(atFrame.map(o=>o.trackId).filter(Boolean));
    const tracks=new Set(objects.filter(o=>o.trackId&&visibleLayers.has(o.layer)).map(o=>o.trackId));
    for(const trackId of tracks){
      if(keyedTracks.has(trackId))continue;
      const keys=objects.filter(o=>o.trackId===trackId&&visibleLayers.has(o.layer)).sort((a,b)=>a.frame-b.frame);
      let before=null,after=null;
      for(const key of keys){if(key.frame<frame)before=key;else if(key.frame>frame){after=key;break}}
      if(!before||!after||before.type!==after.type)continue;
      if(settings.blank_keyframes?.[before.layer]?.some(blankFrame=>blankFrame>before.frame&&blankFrame<=frame))continue;
      const linearAmount=(frame-before.frame)/(after.frame-before.frame);
      const amount=easeProgress(linearAmount,before.easing||settings.tween_easing||'linear');
      const tween={...before,id:`tween:${trackId}:${frame}`,frame,generatedTween:true};
      for(const key of ['x','y','x2','y2','width','opacity','textSize','rotation']){
        if(Number.isFinite(before[key])&&Number.isFinite(after[key]))tween[key]=before[key]+(after[key]-before[key])*amount;
      }
      if(Array.isArray(before.points)&&Array.isArray(after.points)&&before.points.length===after.points.length){
        tween.points=before.points.map((point,index)=>({...point,
          x:point.x+(after.points[index].x-point.x)*amount,
          y:point.y+(after.points[index].y-point.y)*amount
        }));
      }
      atFrame.push(tween);
    }
    const layerOrder=new Map(layers.map((layer,index)=>[layer.id,index]));
    if(canCache){frameObjectsCache.set(cacheKey,atFrame);while(frameObjectsCache.size>80)frameObjectsCache.delete(frameObjectsCache.keys().next().value)}
    return atFrame.sort((a,b)=>(layerOrder.get(b.layer)??-1)-(layerOrder.get(a.layer)??-1));
  }
  function easeProgress(value,easing){
    if(easing==='ease-in')return value*value;
    if(easing==='ease-out')return 1-(1-value)*(1-value);
    if(easing==='ease-in-out')return value<.5?2*value*value:1-Math.pow(-2*value+2,2)/2;
    return value;
  }
  function renderGradientStops(){
    const container=$('gradientStops');
    if(!container)return;
    container.replaceChildren();
    settings.fill_gradient_stops.forEach((stop,index)=>{
      const row=document.createElement('div');row.className='gradient-stop';
      const position=document.createElement('input');position.type='number';position.min=0;position.max=100;position.value=stop.offset;position.setAttribute('aria-label',`Позиция стопа ${index+1}`);
      position.oninput=()=>{stop.offset=Math.max(0,Math.min(100,Number(position.value)||0));save()};
      const color=document.createElement('input');color.type='color';color.value=stop.color;color.setAttribute('aria-label',`Цвет стопа ${index+1}`);
      color.oninput=()=>{stop.color=color.value;save();render()};
      const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.title='Удалить стоп';remove.disabled=settings.fill_gradient_stops.length<=2;
      remove.onclick=()=>{if(settings.fill_gradient_stops.length<=2)return;settings.fill_gradient_stops.splice(index,1);renderGradientStops();save();render()};
      row.append(position,color,remove);container.appendChild(row)
    })
  }
  function gradientForObject(){
    return {type:settings.fill_gradient_type==='radial'?'radial':'linear',angle:Math.max(-360,Math.min(360,Number(settings.fill_gradient_angle)||0)),stops:settings.fill_gradient_stops.map(stop=>({offset:Number(stop.offset),color:stop.color}))}
  }
  function setObjectFill(c,o,ghost,ghostMode,ghostColor){
    if(ghost&&ghostMode==='tinted'){c.fillStyle=ghostColor;return}
    if(ghost||!validGradient(o.fillGradient)||['line','stroke','eraser','blur'].includes(o.type)){c.fillStyle=ghost&&ghostMode==='outline'?'transparent':(o.fill||'transparent');return}
    const bounds=objectBounds(o),cx=bounds.x+bounds.w/2,cy=bounds.y+bounds.h/2;
    if(o.fillGradient.type==='radial'){
      const radius=Math.max(1,Math.hypot(bounds.w,bounds.h)/2);
      c.fillStyle=c.createRadialGradient(cx,cy,0,cx,cy,radius)
    }else{
      const angle=(Number(o.fillGradient.angle)||0)*Math.PI/180;let dx=Math.cos(angle)*bounds.w/2,dy=Math.sin(angle)*bounds.h/2;
      if(Math.hypot(dx,dy)<.5)dx=.5;
      c.fillStyle=c.createLinearGradient(cx-dx,cy-dy,cx+dx,cy+dy)
    }
    o.fillGradient.stops.slice().sort((a,b)=>a.offset-b.offset).forEach(stop=>c.fillStyle.addColorStop(Math.max(0,Math.min(1,stop.offset/100)),stop.color))
  }
  function drawShapeBase(c,o,ghost=false,ghostMode='normal',ghostOpacity=.15,ghostColor='',inheritedOpacity=1,layerOverride=null){
    c.save();const bounds=objectBounds(o),cx=bounds.x+bounds.w/2,cy=bounds.y+bounds.h/2;
    if(o.rotation)c.translate(cx,cy),c.rotate(o.rotation*Math.PI/180),c.translate(-cx,-cy);
    const effectiveLayer=layerOverride??o.layer,layerOpacity=layerOpacityById.get(effectiveLayer)??100;
    c.globalAlpha=inheritedOpacity*(o.opacity??100)/100*layerOpacity/100*(ghost?ghostOpacity:1);c.lineWidth=o.width||2;c.strokeStyle=ghost&&ghostMode!=='normal'?ghostColor:(o.stroke||'#24242a');setObjectFill(c,o,ghost,ghostMode,ghostColor);c.lineCap='round';c.lineJoin='round';
    c.setLineDash(o.dash==='dashed'?[9,6]:o.dash==='dotted'?[2,5]:[]);
    if(o.filter)c.filter=o.filter;
    if(!ghost&&o.shadowEnabled===true){c.shadowColor=o.shadowColor||settings.shadow_color||'#20202a';c.shadowBlur=12;c.shadowOffsetX=4;c.shadowOffsetY=4}
    if(o.type==='group'){
      const baseWidth=Math.max(1,Number(o.baseWidth)||bounds.w||1),baseHeight=Math.max(1,Number(o.baseHeight)||bounds.h||1);
      c.globalAlpha=1;c.translate(bounds.x,bounds.y);c.scale(bounds.w/baseWidth,bounds.h/baseHeight);
      const childOpacity=inheritedOpacity*(o.opacity??100)/100;
      (Array.isArray(o.children)?o.children:[]).forEach(child=>drawShape(c,child,ghost,ghostMode,ghostOpacity,ghostColor,childOpacity,effectiveLayer));
      c.restore();return
    }
    if(o.type==='stroke'||o.type==='eraser'||o.type==='blur'){if(o.type!=='stroke'||(o.strokeEnabled!==false&&o.width>0)){const points=o.points||[];c.strokeStyle=o.stroke;c.lineCap='round';c.lineJoin='round';if(o.pressureEnabled&&points.length>1){for(let i=1;i<points.length;i++){c.beginPath();c.moveTo(points[i-1].x,points[i-1].y);c.lineTo(points[i].x,points[i].y);c.lineWidth=(o.width||8)*Math.max(.08,((points[i-1].pressure??1)+(points[i].pressure??1))/2);c.stroke()}}else if(points.length){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));if(points.length===1)c.lineTo(points[0].x+.01,points[0].y+.01);c.lineWidth=o.width||8;c.stroke()}}c.restore();return}
    if(o.type==='image'){let image=imageCache.get(o.src);if(!image){image=new Image();image.onload=()=>{clearRenderCaches();render()};image.src=o.src;imageCache.set(o.src,image)}if(image.complete)c.drawImage(image,o.x,o.y,o.x2-o.x,o.y2-o.y);c.restore();return}
    if(o.type==='text'){c.font=`${o.textSize||36}px Manrope, sans-serif`;c.textBaseline='top';if(o.fillEnabled!==false)setObjectFill(c,o,ghost,ghostMode,ghostColor);c.save();c.translate(o.x,o.y);c.scale(Math.max(.01,Number(o.textScaleX)||1),1);if(o.fillEnabled!==false)c.fillText(o.text||'Текст',0,0);if(o.strokeEnabled!==false&&o.width>0)c.strokeText(o.text||'Текст',0,0);c.restore();c.restore();return}
    c.beginPath();
    const x=Math.min(o.x,o.x2),y=Math.min(o.y,o.y2),w=Math.abs(o.x2-o.x),h=Math.abs(o.y2-o.y);
    if(o.type==='rect'||o.type==='roundrect'){
      const defaultRadius=o.type==='roundrect'?18:0,radius=Math.max(0,Number(o.cornerRadius??defaultRadius)||0),r=Math.min(radius,w/2,h/2);
      if(r>0)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h)
    }
    else if(o.type==='ellipse')c.ellipse((o.x+o.x2)/2,(o.y+o.y2)/2,w/2,h/2,0,0,Math.PI*2);
    else if(o.type==='line'){c.moveTo(o.x,o.y);c.lineTo(o.x2,o.y2)}
    else if(o.type==='triangle'||o.type==='polygon'||o.type==='star'){let sides=o.type==='triangle'?3:o.type==='star'?10:6;let cx=(o.x+o.x2)/2,cy=(o.y+o.y2)/2,rx=w/2,ry=h/2;for(let i=0;i<sides;i++){let a=-Math.PI/2+i*Math.PI*2/sides,r=o.type==='star'&&i%2===1?.43:1,px=cx+Math.cos(a)*rx*r,py=cy+Math.sin(a)*ry*r;i?c.lineTo(px,py):c.moveTo(px,py)}c.closePath()}
    if(o.type!=='line'&&o.fillEnabled!==false&&o.fill&&o.fill!=='transparent')c.fill();
    if(o.strokeEnabled!==false&&o.stroke&&o.width>0)c.stroke();
    c.restore();
  }
  function drawShape(c,o,ghost=false,ghostMode='normal',ghostOpacity=.15,ghostColor='',inheritedOpacity=1,layerOverride=null){
    const effects=ghost?[]:(Array.isArray(o.blurEffects)?o.blurEffects:[]).filter(effect=>Array.isArray(effect.strokes)&&effect.strokes.some(points=>Array.isArray(points)&&points.length));
    if(!effects.length){drawShapeBase(c,o,ghost,ghostMode,ghostOpacity,ghostColor,inheritedOpacity,layerOverride);return}
    const bounds=objectBounds(o);
    const padding=Math.ceil(Math.max(...effects.map(effect=>Math.max(1,Math.min(80,Number(effect.radius)||8))*3+Math.max(1,Math.min(80,Number(effect.size)||8))/2))+24);
    const objectToDraw=layerOverride===null||layerOverride===o.layer?o:{...o,layer:layerOverride};
    const objectCanvas=getBlurredObjectBitmap(objectToDraw,effects,bounds,padding);
    c.save();c.globalAlpha=inheritedOpacity;c.drawImage(objectCanvas,bounds.x-padding,bounds.y-padding);c.restore()
  }
  function rotationControlLayout(x,y,w){
    const rect=canvas.getBoundingClientRect(),unit=rect.width?canvas.width/rect.width:1;
    const radius=14*unit,centerX=x+w/2,groupHalfWidth=54*unit;
    const groupX=Math.max(groupHalfWidth,Math.min(canvas.width-groupHalfWidth,centerX));
    const controlY=Math.max(20*unit,y-50*unit);
    return {
      unit,
      radius,
      left:{x:groupX-40*unit,y:controlY},
      rotate:{x:groupX,y:controlY},
      right:{x:groupX+40*unit,y:controlY},
      anchor:{x:centerX,y},
      connectorEnd:{x:groupX,y:controlY+radius}
    };
  }
  function drawRotationControl(position,glyph,fill,unit){
    ctx.beginPath();ctx.arc(position.x,position.y,14*unit,0,Math.PI*2);
    ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#a8d7ff';ctx.lineWidth=2*unit;ctx.stroke();
    ctx.fillStyle='#ffffff';ctx.font=`bold ${21*unit}px "Segoe UI Symbol",sans-serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(glyph,position.x,position.y);
  }
  function drawEraserStroke(c,o){
    const points=o.points||[];
    if(!points.length)return;
    c.save();c.globalCompositeOperation='destination-out';c.strokeStyle='#000';c.lineCap='round';c.lineJoin='round';
    if(o.pressureEnabled&&points.length>1){
      for(let i=1;i<points.length;i++){c.beginPath();c.moveTo(points[i-1].x,points[i-1].y);c.lineTo(points[i].x,points[i].y);c.lineWidth=(o.width||8)*Math.max(.08,((points[i-1].pressure??1)+(points[i].pressure??1))/2);c.stroke()}
    }else{
      c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));
      if(points.length===1)c.lineTo(points[0].x+.01,points[0].y+.01);
      c.lineWidth=o.width||8;c.stroke()
    }
    c.restore()
  }
  function renderFrameObjects(targetCtx,frameObjects,previewObject=null,ghost=false,ghostMode='normal',ghostOpacity=.15,ghostColor='',frame=currentFrame){
    const layerOrder=new Map(layers.map((layer,index)=>[layer.id,index])),groups=new Map();
    const ordered=[...frameObjects].sort((a,b)=>(layerOrder.get(b.layer)??-1)-(layerOrder.get(a.layer)??-1));
    ordered.forEach(item=>{if(!groups.has(item.layer))groups.set(item.layer,[]);groups.get(item.layer).push(item)});
    const layerIds=[...groups.keys()];
    if(previewObject&&!groups.has(previewObject.layer))layerIds.push(previewObject.layer);
    layerIds.sort((a,b)=>(layerOrder.get(b)??-1)-(layerOrder.get(a)??-1));
    const useCache=canReuseSceneCaches()&&(ghost?canCacheOnionLayers():canCacheFrameLayers());
    for(const layerId of layerIds){
      const items=groups.get(layerId)||[],previewOnLayer=previewObject?.layer===layerId,previewEraser=previewOnLayer&&(previewObject.isEraser||previewObject.type==='eraser');
      if(useCache){
        const layerBitmap=getLayerBitmap(frame,layerId,items,ghost,ghostMode,ghostOpacity,ghostColor);
        if(previewEraser){
          const buffer=getLayerRenderBuffer(),bufferCtx=buffer.getContext('2d');
          bufferCtx.clearRect(0,0,buffer.width,buffer.height);bufferCtx.drawImage(layerBitmap,0,0);drawEraserStroke(bufferCtx,previewObject);targetCtx.drawImage(buffer,0,0)
        }else{
          targetCtx.drawImage(layerBitmap,0,0);
          if(previewOnLayer)drawShape(targetCtx,previewObject,ghost,ghostMode,ghostOpacity,ghostColor)
        }
      }else if(items.some(item=>item.isEraser||item.type==='eraser')||previewEraser){
        const buffer=getLayerRenderBuffer(),bufferCtx=buffer.getContext('2d');
        bufferCtx.clearRect(0,0,buffer.width,buffer.height);drawLayerContents(bufferCtx,items,ghost,ghostMode,ghostOpacity,ghostColor);
        if(previewEraser)drawEraserStroke(bufferCtx,previewObject);
        targetCtx.drawImage(buffer,0,0);
        if(previewOnLayer&&!previewEraser)drawShape(targetCtx,previewObject,ghost,ghostMode,ghostOpacity,ghostColor)
      }else{
        drawLayerContents(targetCtx,items,ghost,ghostMode,ghostOpacity,ghostColor);
        if(previewOnLayer)drawShape(targetCtx,previewObject,ghost,ghostMode,ghostOpacity,ghostColor)
      }
    }
  }
  function render(syncControls=true){
    if(pendingCanvasRender!==null){cancelAnimationFrame(pendingCanvasRender);pendingCanvasRender=null}
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle=settings.background_color||'#fbfaf7';ctx.fillRect(0,0,canvas.width,canvas.height);drawGrid();
    if(onion){
      const mode=settings.onion_mode||'normal',count=Number(settings.onion_frames)||2;
      for(let distance=count;distance>=1;distance--){
        const opacity=mode==='outline'?.8:.2/distance;
        if(currentFrame-distance>=1)renderFrameObjects(ctx,currentObjects(currentFrame-distance),null,true,mode,opacity,mode==='tinted'?'#f06b8d':'#579bea',currentFrame-distance);
        if(currentFrame+distance<=frameCount)renderFrameObjects(ctx,currentObjects(currentFrame+distance),null,true,mode,opacity,mode==='tinted'?'#50d2c2':'#579bea',currentFrame+distance);
      }
    }
    renderFrameObjects(ctx,currentObjects(),preview,false,'normal',.15,'',currentFrame);
    if(blurStroke?.points.length){
      ctx.save();ctx.beginPath();ctx.moveTo(blurStroke.points[0].x,blurStroke.points[0].y);
      blurStroke.points.slice(1).forEach(point=>ctx.lineTo(point.x,point.y));
      if(blurStroke.points.length===1)ctx.lineTo(blurStroke.points[0].x+.01,blurStroke.points[0].y+.01);
      ctx.strokeStyle='rgba(22,119,210,.7)';ctx.lineWidth=Math.max(1,Number($('brushSize').value)||8);ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.restore()
    }
    for(const id of (selectedIds.size?selectedIds:(selectedId?[selectedId]:[]))){
      const o=objects.find(x=>x.id===id)||currentObjects().find(x=>x.id===id);
      if(!o)continue;
      const b=objectBounds(o),pad=6,x=b.x-pad,y=b.y-pad,w=b.w+pad*2,h=b.h+pad*2;
      ctx.save();ctx.translate(b.x+b.w/2,b.y+b.h/2);ctx.rotate((o.rotation||0)*Math.PI/180);ctx.translate(-(b.x+b.w/2),-(b.y+b.h/2));
      ctx.setLineDash([5,4]);ctx.strokeStyle='#4da3ff';ctx.lineWidth=1.5;ctx.strokeRect(x,y,w,h);ctx.setLineDash([]);
      const handles=[['nw',x,y],['n',x+w/2,y],['ne',x+w,y],['e',x+w,y+h/2],['se',x+w,y+h],['s',x+w/2,y+h],['sw',x,y+h],['w',x,y+h/2]];
      handles.forEach(([name,hx,hy])=>{ctx.fillStyle='#ffffff';ctx.strokeStyle='#1677d2';ctx.lineWidth=1;ctx.beginPath();ctx.rect(hx-5,hy-5,10,10);ctx.fill();ctx.stroke()});
      const controls=rotationControlLayout(x,y,w);
      if(controls.connectorEnd.y<controls.anchor.y){
        ctx.beginPath();ctx.moveTo(controls.anchor.x,controls.anchor.y);ctx.lineTo(controls.connectorEnd.x,controls.connectorEnd.y);
        ctx.strokeStyle='#1677d2';ctx.lineWidth=Math.max(1,canvas.width/canvas.getBoundingClientRect().width);ctx.setLineDash([]);ctx.stroke();
      }
      drawRotationControl(controls.left,'↶','#17466b',controls.unit);
      drawRotationControl(controls.rotate,'↻','#8b542f',controls.unit);
      drawRotationControl(controls.right,'↷','#17466b',controls.unit);
      ctx.restore();
    }
    canvas.title=selectedIds.size?'↶ и ↷ поворачивают выделение на 15°. Перетаскивайте ↻ для свободного поворота.':'';
    if(marquee){ctx.save();ctx.setLineDash([5,4]);ctx.strokeStyle='#1677d2';ctx.fillStyle='rgba(22,119,210,.10)';const x=Math.min(marquee.start.x,marquee.end.x),y=Math.min(marquee.start.y,marquee.end.y),w=Math.abs(marquee.end.x-marquee.start.x),h=Math.abs(marquee.end.y-marquee.start.y);ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);ctx.restore()}
    if(lassoSelection?.points.length){ctx.save();ctx.beginPath();ctx.moveTo(lassoSelection.points[0].x,lassoSelection.points[0].y);lassoSelection.points.slice(1).forEach(point=>ctx.lineTo(point.x,point.y));if(lassoSelection.points.length>2){ctx.closePath();ctx.fillStyle='rgba(22,119,210,.10)';ctx.fill()}ctx.setLineDash([5,4]);ctx.strokeStyle='#1677d2';ctx.lineWidth=1.5;ctx.stroke();ctx.restore()}
    if(syncControls){syncCornerRadiusControl();syncSelectionPropertyControls();syncSelectionFillControls();syncColors()}
  }
  function syncSelectionPropertyControls(){
    const selection=currentSelection(),editable=editableSelection(selectionContents(selection));
    const strokeWidth=$('strokeWidth'),strokeWidthContext=$('strokeWidthContext'),opacity=$('objectOpacity'),strokeStyle=$('strokeStyle');
    const contextControl=$('strokeWidthContextControl'),widths=editable.map(object=>Number(object.width)||0);
    const widthValue=widths.length&&widths.every(value=>value===widths[0])?String(widths[0]):widths.length?'':'4';
    if(document.activeElement!==strokeWidth){
      strokeWidth.value=widthValue
    }
    if(document.activeElement!==strokeWidthContext)strokeWidthContext.value=widthValue;
    contextControl.classList.toggle('hidden',editable.length===0);
    if(document.activeElement!==opacity){
      const opacityValues=editableSelection(selection).map(object=>Number(object.opacity??100));
      opacity.value=opacityValues.length&&opacityValues.every(value=>value===opacityValues[0])?String(opacityValues[0]):'100';
      $('objectOpacityValue').textContent=`${opacity.value}%`
    }
    if(document.activeElement!==strokeStyle){
      const dashes=editable.map(object=>object.dash||'solid');
      strokeStyle.value=dashes.length&&dashes.every(value=>value===dashes[0])&&['solid','dashed','dotted'].includes(dashes[0])?dashes[0]:'solid'
    }
  }
  function syncCornerRadiusControl(){
    const control=$('cornerRadius');
    const shape=selectionContents(currentSelection()).find(object=>['rect','roundrect'].includes(object.type)&&!object.locked&&!layers.find(layer=>layer.id===object.layer)?.locked);
    control.disabled=!shape;
    control.value=shape?Math.max(0,Number(shape.cornerRadius??(shape.type==='roundrect'?18:0))):18
  }
  function applyZoom(){ $('canvasWrap').style.transform=`translate(${panOffset.x}px,${panOffset.y}px) scale(${zoom})`; $('zoomValue').textContent=`${Math.round(zoom*100)}%`;$('zoomIn').title=`Увеличить масштаб (до 800%)`;$('zoomOut').title='Уменьшить масштаб (минимум 10%)' }
  function renameLayer(layer,row){
    const nameNode=[...row.querySelectorAll('span')].find(node=>!node.classList.contains('layer-eye'));
    if(!nameNode)return;
    const input=document.createElement('input');input.className='layer-rename-input';input.type='text';input.maxLength=160;input.value=layer.name;input.setAttribute('aria-label','Новое имя слоя');
    let finished=false;
    const finish=commit=>{
      if(finished)return;finished=true;
      const name=input.value.trim();
      if(commit&&name&&name!==layer.name){snapshot();layer.name=name;save()}
      else if(commit&&!name)notify('Имя слоя не может быть пустым');
      renderLayers();renderTimeline();render()
    };
    input.addEventListener('keydown',event=>{event.stopPropagation();if(event.key==='Enter'){event.preventDefault();finish(true)}else if(event.key==='Escape'){event.preventDefault();finish(false)}});
    input.addEventListener('click',event=>event.stopPropagation());input.addEventListener('blur',()=>finish(true));
    nameNode.replaceWith(input);input.focus();input.select()
  }
  function reorderLayer(sourceId,targetId,after){
    if(!sourceId||sourceId===targetId)return;
    const source=layers.find(layer=>layer.id===sourceId),target=layers.find(layer=>layer.id===targetId);
    if(!source||!target)return;
    const next=layers.filter(layer=>layer.id!==sourceId),targetIndex=next.findIndex(layer=>layer.id===targetId);
    next.splice(targetIndex+(after?1:0),0,source);
    if(next.every((layer,index)=>layer.id===layers[index].id))return;
    snapshot();layers=next;renderLayers();renderTimeline();render();save()
  }
  function bindLayerRow(element,layer){
    element.draggable=true;element.title='Перетащите ряд, чтобы изменить порядок. Нажмите ✎ или щёлкните правой кнопкой, чтобы переименовать.';
    element.addEventListener('contextmenu',event=>{event.preventDefault();event.stopPropagation();renameLayer(layer,element)});
    element.addEventListener('dragstart',event=>{draggedLayerId=layer.id;element.classList.add('dragging');event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',layer.id)});
    element.addEventListener('dragover',event=>{event.preventDefault();event.dataTransfer.dropEffect='move';const after=event.clientY>element.getBoundingClientRect().top+element.clientHeight/2;element.classList.toggle('drop-after',after);element.classList.toggle('drop-before',!after)});
    element.addEventListener('dragleave',()=>element.classList.remove('drop-before','drop-after'));
    element.addEventListener('drop',event=>{event.preventDefault();const sourceId=draggedLayerId||event.dataTransfer.getData('text/plain'),after=event.clientY>element.getBoundingClientRect().top+element.clientHeight/2;reorderLayer(sourceId,layer.id,after);draggedLayerId=null});
    element.addEventListener('dragend',()=>{draggedLayerId=null;element.classList.remove('dragging','drop-before','drop-after')})
  }
  function renderLayers(){
    const list=$('layerList'),names=$('timelineLayerNames');list.replaceChildren();names.replaceChildren();
    layerOpacityById=new Map(layers.map(layer=>[layer.id,layer.opacity??100]));
    layers.forEach(l=>{
      const el=document.createElement('div');el.className='layer-item'+(l.id===activeLayer?' selected':'');bindLayerRow(el,l);
      const icon=document.createElement('button');icon.type='button';icon.className='layer-icon layer-lock';icon.textContent=l.locked?'▣':'▱';icon.title=l.locked?'Разблокировать слой':'Заблокировать слой';icon.onclick=e=>{e.stopPropagation();l.locked=!l.locked;renderLayers();save()};
      const title=document.createElement('span');title.textContent=l.name;
      const visibility=document.createElement('button');visibility.type='button';visibility.className='layer-actions';visibility.textContent=l.visible?'◉':'⊘';visibility.setAttribute('aria-label',`${l.visible?'Скрыть':'Показать'} слой ${l.name}`);
      visibility.onclick=e=>{e.stopPropagation();l.visible=!l.visible;clearRenderCaches();renderLayers();render()};
      const rename=document.createElement('button');rename.type='button';rename.className='layer-rename-button';rename.textContent='✎';rename.title=`Переименовать слой «${l.name}»`;rename.setAttribute('aria-label',`Переименовать слой ${l.name}`);rename.onclick=e=>{e.stopPropagation();renameLayer(l,el)};
      el.append(icon,title,visibility,rename);el.onclick=()=>{activeLayer=l.id;renderLayers()};list.appendChild(el);
      const row=document.createElement('div');row.className='timeline-layer-name'+(l.id===activeLayer?' selected':'');bindLayerRow(row,l);
      const eye=document.createElement('span');eye.className='layer-eye';eye.textContent=l.visible?'◉':'⊘';const name=document.createElement('span');name.textContent=l.name;
      const edit=document.createElement('button');edit.type='button';edit.className='layer-rename-button';edit.textContent='✎';edit.title=`Переименовать слой «${l.name}»`;edit.setAttribute('aria-label',`Переименовать слой ${l.name}`);edit.onclick=e=>{e.stopPropagation();renameLayer(l,row)};
      row.append(eye,name,edit);row.onclick=()=>{activeLayer=l.id;renderLayers()};names.appendChild(row)
    });
    const active=layers.find(layer=>layer.id===activeLayer);
    $('layerOpacity').value=active?.opacity??100;
    $('layerOpacityValue').textContent=`${$('layerOpacity').value}%`;
    $('layerOpacity').disabled=!active;
    renderAssetLibrary();
  }
  function renderTimeline(){
    const ruler=$('frameRuler'), rows=$('frameRows');ruler.innerHTML='';rows.innerHTML='';
    const keyframes=new Map(),tweenFrames=new Map(),tracks=new Map();
    for(const object of objects){
      if(!keyframes.has(object.layer))keyframes.set(object.layer,new Set());
      keyframes.get(object.layer).add(object.frame);
      if(object.trackId){
        const key=`${object.layer}:${object.trackId}`;
        if(!tracks.has(key))tracks.set(key,[]);
        tracks.get(key).push(object.frame);
      }
    }
    for(const [layerId,frames] of Object.entries(settings.blank_keyframes||{})){
      if(!keyframes.has(layerId))keyframes.set(layerId,new Set());
      frames.forEach(frame=>keyframes.get(layerId).add(frame));
    }
    for(const [key,frames] of tracks){
      const layerId=key.slice(0,key.indexOf(':')),ordered=[...new Set(frames)].sort((a,b)=>a-b);
      if(!tweenFrames.has(layerId))tweenFrames.set(layerId,new Set());
      for(let index=0;index<ordered.length-1;index++)for(let frame=ordered[index]+1;frame<ordered[index+1];frame++){
        if(settings.blank_keyframes?.[layerId]?.some(blankFrame=>blankFrame>ordered[index]&&blankFrame<=frame))break;
        tweenFrames.get(layerId).add(frame)
      }
    }
    for(let i=1;i<=frameCount;i++){
      const n=document.createElement('div');n.className='frame-number'+(settings.frame_markers?.[i]?' marked':'');n.textContent=i;
      if(settings.frame_markers?.[i])n.title=settings.frame_markers[i];
      ruler.appendChild(n)
    }
    layers.forEach(l=>{
      const row=document.createElement('div');row.className='frame-row';
      for(let i=1;i<=frameCount;i++){
        const isBlank=settings.blank_keyframes?.[l.id]?.includes(i),isKey=keyframes.get(l.id)?.has(i),isTween=tweenFrames.get(l.id)?.has(i);
        const cell=document.createElement('div');
        cell.className='frame-cell'+(i===currentFrame?' current':'')+(isKey?' keyframe':'')+(isBlank?' blank-keyframe':'')+(!isKey&&isTween?' tween':'')+(settings.frame_markers?.[i]?' marked':'');
        if(settings.frame_markers?.[i])cell.title=settings.frame_markers[i];
        cell.onclick=()=>{currentFrame=i;updateTimeline();render()};
        row.appendChild(cell)
      }
      rows.appendChild(row)
    });
    $('currentFrameLabel').textContent=currentFrame;$('frameCountLabel').textContent=frameCount;
    $('loopEnd').max=frameCount;$('loopStart').max=frameCount;
  }
  function updateTimeline(){renderTimeline();$('canvasHint').style.opacity=objects.length?'0':'1'}
  function syncColors(){
    const selected=selectionContents(currentSelection())[0];
    strokeColor.value=selected?.stroke&&/^#[0-9a-f]{6}$/i.test(selected.stroke)?selected.stroke:settings.stroke_color||'#f0a36b';
    fillColor.value=selected?.fill&&/^#[0-9a-f]{6}$/i.test(selected.fill)?selected.fill:settings.fill_color||'#f0a36b';
    $('shadowColor').value=selected?.shadowColor&&/^#[0-9a-f]{6}$/i.test(selected.shadowColor)?selected.shadowColor:settings.shadow_color||'#20202a';
    $('shadowEnabled').checked=selected?selected.shadowEnabled===true:settings.shadow_enabled===true
  }
  function selectColorTab(tab){
    document.querySelectorAll('[data-color-tab]').forEach(button=>button.classList.toggle('selected',button.dataset.colorTab===tab));
    document.querySelectorAll('[data-color-view]').forEach(view=>view.classList.toggle('hidden',view.dataset.colorView!==tab))
  }
  $('colorPickerButton').onclick=()=>{
    const open=$('colorPopover').classList.contains('hidden');
    $('colorPopover').classList.toggle('hidden',!open);$('colorPickerButton').setAttribute('aria-expanded',String(open));
    if(open)selectColorTab('stroke')
  };
  document.querySelectorAll('[data-color-tab]').forEach(button=>button.onclick=()=>selectColorTab(button.dataset.colorTab));
  document.addEventListener('pointerdown',event=>{
    if(!$('colorPickerButton').contains(event.target)&&!$('colorPopover').contains(event.target)){
      $('colorPopover').classList.add('hidden');$('colorPickerButton').setAttribute('aria-expanded','false')
    }
  });
  document.querySelectorAll('.tool[data-tool]').forEach(b=>b.addEventListener('click',()=>setTool(b.dataset.tool)));
  function setTool(t){
    tool=t;document.querySelectorAll('.tool[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===t));$('activeToolLabel').textContent=labels[t]||t;$('toolBadge').textContent=t.toUpperCase();canvas.style.cursor=t==='select'?'default':t==='text'?'text':'crosshair';
    $('blurSettings').classList.toggle('hidden',t!=='blur');
    if(['brush','pencil','rect','ellipse','line','text','polygon','star','triangle','roundrect'].includes(t))markLearningComplete('Выбрать инструмент');
    if(t==='blur')markLearningComplete('Размыть объект');
  }
  function hit(p,o){if(o.isEraser||o.type==='eraser')return false;if(o.type==='stroke'){return (o.points||[]).some(q=>Math.hypot(q.x-p.x,q.y-p.y)<Math.max(10,o.width))}if(o.type==='text')return p.x>=o.x&&p.x<o.x+160&&p.y>=o.y&&p.y<o.y+(o.textSize||30)*1.3;return p.x>=Math.min(o.x,o.x2)-5&&p.x<=Math.max(o.x,o.x2)+5&&p.y>=Math.min(o.y,o.y2)-5&&p.y<=Math.max(o.y,o.y2)+5}
  function objectBounds(o){
    if(o.type==='stroke'||o.type==='blur'||o.type==='eraser'){
      const points=o.points||[];
      if(!points.length)return {x:0,y:0,w:0,h:0};
      const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
      const x=Math.min(...xs),y=Math.min(...ys);
      return {x,y,w:Math.max(1,Math.max(...xs)-x),h:Math.max(1,Math.max(...ys)-y)};
    }
    if(o.type==='text'){
      const w=Math.max(40,(o.text||'Текст').length*(o.textSize||36)*.58)*Math.max(.01,Number(o.textScaleX)||1);
      const h=(o.textSize||36)*1.25;
      return {x:o.x,y:o.y,w,h};
    }
    return {x:Math.min(o.x,o.x2??o.x),y:Math.min(o.y,o.y2??o.y),w:Math.abs((o.x2??o.x)-o.x),h:Math.abs((o.y2??o.y)-o.y)};
  }
  function translateBlurEffects(object,dx,dy){
    object.blurEffects?.forEach(effect=>effect.strokes?.forEach(points=>points.forEach(point=>{point.x+=dx;point.y+=dy})))
  }
  function translateObjectGeometry(object,dx,dy){
    if(['stroke','blur','eraser'].includes(object.type)){
      (object.points||[]).forEach(point=>{point.x+=dx;point.y+=dy})
    }else{
      if(Number.isFinite(object.x))object.x+=dx;
      if(Number.isFinite(object.y))object.y+=dy;
      if(Number.isFinite(object.x2))object.x2+=dx;
      if(Number.isFinite(object.y2))object.y2+=dy
    }
    translateBlurEffects(object,dx,dy)
  }
  function refreshObjectIds(object){
    object.id=crypto.randomUUID();
    if(Array.isArray(object.children))object.children.forEach(refreshObjectIds);
    return object
  }
  function cloneObjectToFrame(object,frame){
    const clone=refreshObjectIds(JSON.parse(JSON.stringify(object)));
    setObjectLayerAndFrame(clone,object.layer,frame);
    delete clone.generatedTween;
    return clone
  }
  function setObjectLayerAndFrame(object,layer,frame){
    object.layer=layer;object.frame=frame;
    if(Array.isArray(object.children))object.children.forEach(child=>setObjectLayerAndFrame(child,layer,frame))
  }
  function objectContainsEraser(object){
    return object.isEraser===true||object.type==='eraser'||(Array.isArray(object.children)&&object.children.some(objectContainsEraser))
  }
  function pointInPolygon(point,polygon){
    let inside=false;
    for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
      const a=polygon[i],b=polygon[j];
      if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
    }
    return inside
  }
  function segmentsIntersect(a,b,c,d){
    const cross=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
    const onSegment=(p,q,r)=>q.x>=Math.min(p.x,r.x)-.001&&q.x<=Math.max(p.x,r.x)+.001&&q.y>=Math.min(p.y,r.y)-.001&&q.y<=Math.max(p.y,r.y)+.001;
    const abC=cross(a,b,c),abD=cross(a,b,d),cdA=cross(c,d,a),cdB=cross(c,d,b);
    return abC*abD<0&&cdA*cdB<0||Math.abs(abC)<.001&&onSegment(a,c,b)||Math.abs(abD)<.001&&onSegment(a,d,b)||Math.abs(cdA)<.001&&onSegment(c,a,d)||Math.abs(cdB)<.001&&onSegment(c,b,d)
  }
  function lassoIntersectsObject(polygon,object){
    const bounds=objectBounds(object),left=bounds.x,top=bounds.y,right=left+bounds.w,bottom=top+bounds.h;
    if(object.type==='stroke'){
      const points=object.points||[];
      if(points.some(point=>pointInPolygon(point,polygon)))return true;
      for(let i=1;i<points.length;i++)for(let j=0;j<polygon.length;j++)if(segmentsIntersect(points[i-1],points[i],polygon[j],polygon[(j+1)%polygon.length]))return true;
      return false
    }
    const corners=[{x:left,y:top},{x:right,y:top},{x:right,y:bottom},{x:left,y:bottom}];
    if(pointInPolygon({x:(left+right)/2,y:(top+bottom)/2},polygon)||corners.some(point=>pointInPolygon(point,polygon))||polygon.some(point=>point.x>=left&&point.x<=right&&point.y>=top&&point.y<=bottom))return true;
    for(let i=0;i<polygon.length;i++)for(let j=0;j<corners.length;j++)if(segmentsIntersect(polygon[i],polygon[(i+1)%polygon.length],corners[j],corners[(j+1)%corners.length]))return true;
    return false
  }
  function fitStrokeLine(points,jitter,sensitivity,forced=false){
    if(points.length<2)return null;
    const center=points.reduce((sum,point)=>({x:sum.x+point.x/points.length,y:sum.y+point.y/points.length}),{x:0,y:0});
    let xx=0,yy=0,xy=0;
    points.forEach(point=>{const x=point.x-center.x,y=point.y-center.y;xx+=x*x;yy+=y*y;xy+=x*y});
    const angle=Math.atan2(2*xy,xx-yy)/2,axis={x:Math.cos(angle),y:Math.sin(angle)},normal={x:-axis.y,y:axis.x};
    let min=Infinity,max=-Infinity,squaredError=0,maxError=0;
    for(const point of points){
      const dx=point.x-center.x,dy=point.y-center.y,along=dx*axis.x+dy*axis.y,across=Math.abs(dx*normal.x+dy*normal.y);
      min=Math.min(min,along);max=Math.max(max,along);squaredError+=across*across;maxError=Math.max(maxError,across);
    }
    const length=max-min;
    if(length<=jitter*2)return null;
    const tolerance=forced?Math.max(jitter*(1+sensitivity*.015),length*(.06+sensitivity*.0008)):jitter*(.75+sensitivity*.75);
    if(Math.sqrt(squaredError/points.length)>tolerance*(forced ? .75 : .55)||maxError>tolerance*(forced ? 1.8 : 1))return null;
    return {x:center.x+axis.x*min,y:center.y+axis.y*min,x2:center.x+axis.x*max,y2:center.y+axis.y*max}
  }
  function rdpSimplify(points,epsilon){
    if(points.length<=2||epsilon<=0)return points.map(p=>({...p}));
    const keep=new Uint8Array(points.length);keep[0]=1;keep[points.length-1]=1;
    const stack=[[0,points.length-1]];
    while(stack.length){
      const [start,end]=stack.pop();
      if(end-start<2)continue;
      const a=points[start],b=points[end],dx=b.x-a.x,dy=b.y-a.y,lenSq=dx*dx+dy*dy;
      let maxDist=0,maxIdx=-1;
      for(let i=start+1;i<end;i++){
        const p=points[i];
        const d=lenSq>1e-6?Math.abs(dy*p.x-dx*p.y+b.x*a.y-b.y*a.x)/Math.sqrt(lenSq):Math.hypot(p.x-a.x,p.y-a.y);
        if(d>maxDist){maxDist=d;maxIdx=i}
      }
      if(maxDist>epsilon&&maxIdx>=0){keep[maxIdx]=1;stack.push([start,maxIdx],[maxIdx,end])}
    }
    return points.filter((_,i)=>keep[i]).map(p=>({...p}))
  }
  function softenStrokePoints(points,passes,blend){
    let result=points.map(point=>({...point}));
    for(let pass=0;pass<passes;pass++){
      const next=result.map(point=>({...point}));
      for(let i=1;i<result.length-1;i++){
        const previous=result[i-1],current=result[i],following=result[i+1];
        const averageX=(previous.x+2*current.x+following.x)/4,averageY=(previous.y+2*current.y+following.y)/4;
        const averagePressure=((previous.pressure??1)+2*(current.pressure??1)+(following.pressure??1))/4;
        next[i]={x:current.x+(averageX-current.x)*blend,y:current.y+(averageY-current.y)*blend,pressure:Math.max(.08,Math.min(1,(current.pressure??1)+(averagePressure-(current.pressure??1))*blend))}
      }
      result=next
    }
    return result
  }
  function pointAtArcOffset(points,index,offsetDist,closed){
    const n=points.length,dir=offsetDist>=0?1:-1;
    let remaining=Math.abs(offsetDist),cur=index,steps=0;
    while(steps<n){
      const next=closed?(cur+dir+n)%n:cur+dir;
      if(next<0||next>=n)break;
      const d=Math.hypot(points[next].x-points[cur].x,points[next].y-points[cur].y);
      if(d>=remaining&&d>1e-6){
        const t=remaining/d;
        return {x:points[cur].x+(points[next].x-points[cur].x)*t,y:points[cur].y+(points[next].y-points[cur].y)*t}
      }
      remaining-=d;cur=next;steps++
    }
    return points[cur]
  }
  function detectStrokeCorners(points,windowDist,angleThresholdDeg){
    if(points.length<5)return [];
    const angles=new Float32Array(points.length);
    for(let i=1;i<points.length-1;i++){
      const prev=pointAtArcOffset(points,i,-windowDist,false),next=pointAtArcOffset(points,i,windowDist,false);
      const v1x=points[i].x-prev.x,v1y=points[i].y-prev.y,v2x=next.x-points[i].x,v2y=next.y-points[i].y;
      const l1=Math.hypot(v1x,v1y),l2=Math.hypot(v2x,v2y);
      if(l1<windowDist*.35||l2<windowDist*.35)continue;
      const dot=Math.max(-1,Math.min(1,(v1x*v2x+v1y*v2y)/(l1*l2)));
      angles[i]=Math.acos(dot)*180/Math.PI
    }
    const corners=[];
    for(let i=2;i<points.length-2;i++){
      if(angles[i]<angleThresholdDeg)continue;
      if(angles[i]>=angles[i-1]&&angles[i]>=angles[i+1]){
        const lastCorner=corners.length?points[corners[corners.length-1]]:points[0];
        if(Math.hypot(points[i].x-lastCorner.x,points[i].y-lastCorner.y)>=windowDist*.8)corners.push(i)
      }
    }
    return corners
  }
  function catmullRomSegment(points,stepPx=5,closed=false){
    if(points.length<=2)return points.map(p=>({...p}));
    const n=points.length,result=[];
    const getPt=i=>closed?points[(i%n+n)%n]:points[Math.max(0,Math.min(n-1,i))];
    const count=closed?n:n-1;
    for(let i=0;i<count;i++){
      const p0=getPt(i-1),p1=getPt(i),p2=getPt(i+1),p3=getPt(i+2);
      const segLen=Math.hypot(p2.x-p1.x,p2.y-p1.y);
      const steps=Math.max(1,Math.min(24,Math.ceil(segLen/stepPx)));
      for(let s=0;s<steps;s++){
        const t=s/steps,t2=t*t,t3=t2*t;
        const x=.5*((2*p1.x)+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3);
        const y=.5*((2*p1.y)+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3);
        const pr0=p0.pressure??1,pr1=p1.pressure??1,pr2=p2.pressure??1,pr3=p3.pressure??1;
        const pressure=Math.max(.08,Math.min(1,.5*((2*pr1)+(-pr0+pr2)*t+(2*pr0-5*pr1+4*pr2-pr3)*t2+(-pr0+3*pr1-3*pr2+pr3)*t3)));
        result.push({x,y,pressure})
      }
    }
    if(!closed)result.push({...points[n-1]});
    else if(result.length)result.push({...result[0]});
    return result
  }
  function isSegmentStraight(seg,tolerance){
    if(seg.length<=2)return true;
    const a=seg[0],b=seg[seg.length-1],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
    if(len<1)return true;
    let maxDev=0,sumSq=0;
    for(let i=1;i<seg.length-1;i++){
      const d=Math.abs(dy*seg[i].x-dx*seg[i].y+b.x*a.y-b.y*a.x)/len;
      maxDev=Math.max(maxDev,d);sumSq+=d*d
    }
    const rms=Math.sqrt(sumSq/Math.max(1,seg.length-2));
    return rms<=tolerance*.65&&maxDev<=tolerance*1.25
  }
  function smoothStroke(stroke,forced=false){
    const selectedMode=forced?'auto':settings.curve_smoothing_enabled===false?'off':settings.curve_smoothing;
    const floxAi=selectedMode==='flox_ai',mode=floxAi?'auto':selectedMode,points=stroke.points||[];
    if((mode==='off'||mode==='manual')&&!forced||points.length<2)return stroke;
    const sensitivity=(settings.smoothing_sensitivity??50)/100,jitter=Math.max(1,Number(settings.smoothing_jitter_threshold)||6);
    const first=points[0],last=points[points.length-1];
    const bounds=points.reduce((b,p)=>({minX:Math.min(b.minX,p.x),maxX:Math.max(b.maxX,p.x),minY:Math.min(b.minY,p.y),maxY:Math.max(b.maxY,p.y)}),{minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity});
    const {minX,maxX,minY,maxY}=bounds,w=maxX-minX,h=maxY-minY,diagonal=Math.max(1,Math.hypot(w,h));
    const closed=points.length>=8&&Math.hypot(first.x-last.x,first.y-last.y)<Math.max(24,stroke.width*2.5,diagonal*.12);
    const geometryThreshold=Math.max((forced||floxAi)?0.14:0,.028+sensitivity*.075+jitter/diagonal*.18);
    if(closed&&points.length>=12&&['geometry','auto'].includes(mode)){
      const cx=(minX+maxX)/2,cy=(minY+maxY)/2,rx=Math.max(1,w/2),ry=Math.max(1,h/2);
      const radial=points.map(p=>Math.sqrt(((p.x-cx)/rx)**2+((p.y-cy)/ry)**2));
      const error=radial.reduce((sum,value)=>sum+Math.abs(value-1),0)/radial.length;
      if(error<geometryThreshold){
        const aspect=Math.max(w,h)/Math.max(1,Math.min(w,h));
        if(aspect<1.12){const side=(w+h)/2;return {...stroke,type:'ellipse',x:cx-side/2,y:cy-side/2,x2:cx+side/2,y2:cy+side/2,points:undefined,pressureEnabled:false}}
        return {...stroke,type:'ellipse',x:minX,y:minY,x2:maxX,y2:maxY,points:undefined,pressureEnabled:false}
      }
      if(w>1&&h>1){
        let edgeError=0;const counts=[0,0,0,0];
        for(const point of points){const distances=[Math.abs(point.x-minX),Math.abs(point.x-maxX),Math.abs(point.y-minY),Math.abs(point.y-maxY)],nearest=distances.indexOf(Math.min(...distances));edgeError+=distances[nearest]/diagonal;counts[nearest]++}
        if(edgeError/points.length<geometryThreshold*.5&&counts.every(count=>count/points.length>.05))return {...stroke,type:'rect',x:minX,y:minY,x2:maxX,y2:maxY,points:undefined,pressureEnabled:false};
      }
    }
    if(!closed&&w>jitter*2&&h>jitter*2&&['curves','geometry','auto'].includes(mode)){
      const horizontal=Math.abs(first.x-minX)<w*.25&&Math.abs(last.x-maxX)<w*.25||Math.abs(last.x-minX)<w*.25&&Math.abs(first.x-maxX)<w*.25;
      const baseY=(first.y+last.y)/2,baseYEdge=Math.abs(baseY-maxY)<Math.abs(baseY-minY)?maxY:minY;
      const endpointsNearBase=Math.abs(first.y-baseYEdge)<h*.24&&Math.abs(last.y-baseYEdge)<h*.24;
      const vertical=Math.abs(first.y-minY)<h*.25&&Math.abs(last.y-maxY)<h*.25||Math.abs(last.y-minY)<h*.25&&Math.abs(first.y-maxY)<h*.25;
      const baseX=(first.x+last.x)/2,baseXEdge=Math.abs(baseX-maxX)<Math.abs(baseX-minX)?maxX:minX;
      const verticalEndpointsNearBase=Math.abs(first.x-baseXEdge)<w*.24&&Math.abs(last.x-baseXEdge)<w*.24;
      let arcError=Infinity,arcPoints=null;
      const avgPressure=points.reduce((sum,p)=>sum+(p.pressure??1),0)/points.length;
      if(horizontal&&endpointsNearBase&&w/h>1.15&&w/h<4){
        const cx=(minX+maxX)/2,rx=w/2,ry=h,upper=baseYEdge===maxY;
        arcError=points.reduce((sum,p)=>sum+Math.abs(Math.hypot((p.x-cx)/rx,(p.y-baseYEdge)/ry)-1),0)/points.length;
        if(arcError<geometryThreshold){
          const forward=first.x<last.x,samples=Math.max(24,Math.min(120,points.length));
          arcPoints=Array.from({length:samples},(_,i)=>{const t=i/(samples-1),angle=forward?Math.PI*(1-t):Math.PI*t;return {x:cx+rx*Math.cos(angle),y:baseYEdge+(upper?-1:1)*ry*Math.sin(angle),pressure:avgPressure}})
        }
      }else if(vertical&&verticalEndpointsNearBase&&h/w>1.15&&h/w<4){
        const cy=(minY+maxY)/2,ry=h/2,rx=w,side=baseXEdge===maxX?1:-1;
        arcError=points.reduce((sum,p)=>sum+Math.abs(Math.hypot((p.x-baseXEdge)/rx,(p.y-cy)/ry)-1),0)/points.length;
        if(arcError<geometryThreshold){
          const forward=first.y<last.y,samples=Math.max(24,Math.min(120,points.length));
          arcPoints=Array.from({length:samples},(_,i)=>{const t=i/(samples-1),angle=forward?Math.PI*(1-t):Math.PI*t;return {x:baseXEdge+side*rx*Math.sin(angle),y:cy+ry*Math.cos(angle),pressure:avgPressure}})
        }
      }
      if(arcPoints&&(mode!=='curves'||arcError<geometryThreshold))return {...stroke,points:arcPoints};
    }
    if(['straight','geometry','auto'].includes(mode)||forced){
      const line=fitStrokeLine(points,jitter,sensitivity,forced||floxAi);
      if(line)return {...stroke,type:'line',...line,points:undefined,pressureEnabled:false};
    }
    const windowDist=Math.max(8,jitter*(mode==='light'?1.4:mode==='strong'?2:1.8));
    const angleThreshold=mode==='light'?68-sensitivity*12:mode==='strong'?78-sensitivity*12:mode==='auto'?56-sensitivity*8:54;
    const corners=detectStrokeCorners(points,windowDist,angleThreshold);
    const splitIndices=[0,...corners,points.length-1];
    const epsilon=mode==='light'?Math.max(.5,jitter*(.22+sensitivity*.28)):mode==='strong'?Math.max(.8,jitter*(.35+sensitivity*.6)):Math.max(.8,jitter*(.22+sensitivity*.42));
    const straightTol=jitter*(.55+sensitivity*.75);
    const allowStraightSegments=['straight','strong','geometry','auto'].includes(mode)||forced;
    const output=[];
    for(let s=0;s<splitIndices.length-1;s++){
      const seg=points.slice(splitIndices[s],splitIndices[s+1]+1);
      if(seg.length<2)continue;
      let processed;
      if(mode==='straight'||(allowStraightSegments&&seg.length>=3&&isSegmentStraight(seg,straightTol))){
        processed=[{...seg[0]},{...seg[seg.length-1]}]
      }else{
        const simplified=rdpSimplify(seg,epsilon);
        const softened=softenStrokePoints(simplified,mode==='light'?1:2,mode==='light' ? 0.65 : 0.8);
        processed=catmullRomSegment(softened,mode==='light'?4:5,closed&&splitIndices.length===2)
      }
      if(s>0&&processed.length)processed=processed.slice(1);
      output.push(...processed)
    }
    if(output.length<2)return stroke;
    return {...stroke,points:output.slice(0,8000)};
  }
  function snapStrokeToGrid(stroke){
    if(!settings.grid_snap_enabled||stroke.type!=='stroke'||!Array.isArray(stroke.points))return stroke;
    const step=Math.max(10,Number(settings.grid_size)||100),points=[];
    stroke.points.forEach(point=>{
      const snapped={...point,x:Math.round(point.x/step)*step,y:Math.round(point.y/step)*step};
      const previous=points[points.length-1];
      if(previous&&previous.x===snapped.x&&previous.y===snapped.y)previous.pressure=snapped.pressure;
      else points.push(snapped)
    });
    return {...stroke,points}
  }
  function fillHit(p,object){
    if(!['rect','roundrect','ellipse','triangle','polygon','star','text'].includes(object.type))return false;
    const bounds=objectBounds(object),cx=bounds.x+bounds.w/2,cy=bounds.y+bounds.h/2,rotation=-(object.rotation||0)*Math.PI/180;
    const dx=p.x-cx,dy=p.y-cy,local={x:cx+dx*Math.cos(rotation)-dy*Math.sin(rotation),y:cy+dx*Math.sin(rotation)+dy*Math.cos(rotation)};
    const {x,y,w,h}=bounds;
    if(local.x<x||local.x>x+w||local.y<y||local.y>y+h)return false;
    if(object.type==='ellipse'){const nx=(local.x-(x+w/2))/Math.max(1,w/2),ny=(local.y-(y+h/2))/Math.max(1,h/2);return nx*nx+ny*ny<=1}
    if(object.type==='rect'||object.type==='roundrect'){
      const defaultRadius=object.type==='roundrect'?18:0,radius=Math.min(Math.max(0,Number(object.cornerRadius??defaultRadius)||0),w/2,h/2);
      if(radius===0)return true;
      const nearestX=Math.max(x+radius,Math.min(x+w-radius,local.x)),nearestY=Math.max(y+radius,Math.min(y+h-radius,local.y));
      return Math.hypot(local.x-nearestX,local.y-nearestY)<=radius
    }
    if(['triangle','polygon','star'].includes(object.type)){
      const sides=object.type==='triangle'?3:object.type==='star'?10:6,vertices=Array.from({length:sides},(_,i)=>{const angle=-Math.PI/2+i*Math.PI*2/sides,radius=object.type==='star'&&i%2===1?.43:1;return {x:x+w/2+Math.cos(angle)*w/2*radius,y:y+h/2+Math.sin(angle)*h/2*radius}});
      let inside=false;
      for(let i=0,j=vertices.length-1;i<vertices.length;j=i++){const a=vertices[i],b=vertices[j];if((a.y>local.y)!==(b.y>local.y)&&local.x<(b.x-a.x)*(local.y-a.y)/(b.y-a.y)+a.x)inside=!inside}
      return inside
    }
    return true
  }
  function hasOverlayAbove(p,target,frameObjects){
    const index=frameObjects.indexOf(target);
    if(index<0)return false;
    for(let i=index+1;i<frameObjects.length;i++){
      const other=frameObjects[i];
      if(other.type==='image')continue;
      const b=objectBounds(other),pad=Math.max(4,(other.width||2)/2+2);
      if(p.x>=b.x-pad&&p.x<=b.x+b.w+pad&&p.y>=b.y-pad&&p.y<=b.y+b.h+pad)return true
    }
    return false
  }
  function insertFillObject(fillObj,minX,minY,maxX,maxY){
    const strokeIndex=objects.findIndex(o=>{
      if(o.frame!==currentFrame||o.layer!==activeLayer)return false;
      if(!['stroke','line'].includes(o.type))return false;
      const b=objectBounds(o),pad=Math.max(4,(o.width||2)/2);
      return !(b.x+b.w+pad<minX||b.x-pad>maxX+1||b.y+b.h+pad<minY||b.y-pad>maxY+1)
    });
    if(strokeIndex>=0)objects.splice(strokeIndex,0,fillObj);
    else objects.push(fillObj)
  }
  function fillClosedRegion(p,frameObjects){
    if(frameObjects.some(object=>object.type==='image'&&(!imageCache.get(object.src)?.complete||!imageCache.get(object.src)?.naturalWidth))){notify('Дождитесь загрузки изображений на кадре и повторите заливку');return false}
    if(!frameObjects.length){
      snapshot();settings.background_color=fillColor.value;$('backgroundColor').value=settings.background_color;finishChange();notify('Заливка фона изменена');return true
    }
    if(layers.find(layer=>layer.id===activeLayer)?.locked){notify('Активный слой заблокирован');return false}
    const scene=document.createElement('canvas');scene.width=canvas.width;scene.height=canvas.height;
    const sceneContext=scene.getContext('2d',{willReadFrequently:true});sceneContext.fillStyle=settings.background_color||'#fbfaf7';sceneContext.fillRect(0,0,scene.width,scene.height);
    renderFrameObjects(sceneContext,frameObjects);
    const pixels=sceneContext.getImageData(0,0,scene.width,scene.height),data=pixels.data,width=scene.width,height=scene.height,size=width*height;
    const startX=Math.floor(p.x),startY=Math.floor(p.y);
    if(startX<0||startY<0||startX>=width||startY>=height)return false;
    const startIndex=startY*width+startX,seedIndex=startIndex*4,seedR=data[seedIndex],seedG=data[seedIndex+1],seedB=data[seedIndex+2];
    const background=parseInt((settings.background_color||'#fbfaf7').slice(1),16),backgroundR=background>>16,backgroundG=(background>>8)&255,backgroundB=background&255;
    let hasVisibleSceneContent=false;
    for(let offset=0;offset<data.length;offset+=4){
      if(Math.abs(data[offset]-backgroundR)>4||Math.abs(data[offset+1]-backgroundG)>4||Math.abs(data[offset+2]-backgroundB)>4){hasVisibleSceneContent=true;break}
    }
    if(!hasVisibleSceneContent){
      snapshot();settings.background_color=fillColor.value;$('backgroundColor').value=settings.background_color;finishChange();notify('Заливка фона изменена');return true
    }
    const seedHasVisibleContent=Math.abs(seedR-backgroundR)>8||Math.abs(seedG-backgroundG)>8||Math.abs(seedB-backgroundB)>8;
    const color=parseInt(fillColor.value.slice(1),16),targetR=color>>16,targetG=(color>>8)&255,targetB=color&255;
    if(Math.abs(seedR-targetR)<=4&&Math.abs(seedG-targetG)<=4&&Math.abs(seedB-targetB)<=4){notify('Эта область уже залита выбранным цветом');return false}
    const tolerance=36,toleranceSquared=tolerance*tolerance*3;
    const visited=new Uint8Array(size),stack=new Uint32Array(size);
    let stackLength=0,regionSize=0,touchesTop=false,touchesBottom=false,touchesLeft=false,touchesRight=false,minX=width,minY=height,maxX=0,maxY=0;
    const colorDistSq=index=>{const offset=index*4,dr=data[offset]-seedR,dg=data[offset+1]-seedG,db=data[offset+2]-seedB;return dr*dr+dg*dg+db*db};
    const matches=index=>colorDistSq(index)<=toleranceSquared;
    stack[stackLength++]=startIndex;visited[startIndex]=1;
    while(stackLength){
      const index=stack[--stackLength],x=index%width,y=(index/width)|0;
      regionSize++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
      if(x===0)touchesLeft=true;if(x===width-1)touchesRight=true;if(y===0)touchesTop=true;if(y===height-1)touchesBottom=true;
      if(x>0&&!visited[index-1]&&matches(index-1)){visited[index-1]=1;stack[stackLength++]=index-1}
      if(x<width-1&&!visited[index+1]&&matches(index+1)){visited[index+1]=1;stack[stackLength++]=index+1}
      if(y>0&&!visited[index-width]&&matches(index-width)){visited[index-width]=1;stack[stackLength++]=index-width}
      if(y<height-1&&!visited[index+width]&&matches(index+width)){visited[index+width]=1;stack[stackLength++]=index+width}
    }
    if(regionSize<16){notify('В этой точке нет области для заливки');return false}
    const allEdges=touchesTop&&touchesBottom&&touchesLeft&&touchesRight;
    if(regionSize>size*.85||(allEdges&&regionSize>size*.45)){
      if(!seedHasVisibleContent){
        snapshot();settings.background_color=fillColor.value;$('backgroundColor').value=settings.background_color;finishChange();notify('Заливка фона изменена');return true
      }
      notify('Контур открыт или выходит за край холста — замкните его перед заливкой');return false
    }
    const padMinX=Math.max(0,minX-1),padMinY=Math.max(0,minY-1),padMaxX=Math.min(width-1,maxX+1),padMaxY=Math.min(height-1,maxY+1);
    const boxWidth=padMaxX-padMinX+1,boxHeight=padMaxY-padMinY+1,output=document.createElement('canvas');output.width=boxWidth;output.height=boxHeight;
    const outputContext=output.getContext('2d'),imageData=outputContext.createImageData(boxWidth,boxHeight);
    for(let y=padMinY;y<=padMaxY;y++)for(let x=padMinX;x<=padMaxX;x++){
      const sourceIndex=y*width+x,offset=((y-padMinY)*boxWidth+x-padMinX)*4;
      if(visited[sourceIndex]){
        imageData.data[offset]=targetR;imageData.data[offset+1]=targetG;imageData.data[offset+2]=targetB;imageData.data[offset+3]=255;
        continue
      }
      const touchesVisited=(x>0&&visited[sourceIndex-1])||(x<width-1&&visited[sourceIndex+1])||(y>0&&visited[sourceIndex-width])||(y<height-1&&visited[sourceIndex+width]);
      if(touchesVisited){
        const dist=Math.sqrt(colorDistSq(sourceIndex)),alpha=Math.round(255*Math.max(.35,Math.min(1,1-(dist-tolerance)/180)));
        imageData.data[offset]=targetR;imageData.data[offset+1]=targetG;imageData.data[offset+2]=targetB;imageData.data[offset+3]=alpha
      }
    }
    outputContext.putImageData(imageData,0,0);
    const src=output.toDataURL('image/png');
    if(src.length>12000000){notify('Область слишком велика для сохранения заливки');return false}
    snapshot();
    insertFillObject({id:crypto.randomUUID(),type:'image',src,x:padMinX,y:padMinY,x2:padMaxX+1,y2:padMaxY+1,opacity:100,fillEnabled:true,strokeEnabled:false,width:0,layer:activeLayer,frame:currentFrame},padMinX,padMinY,padMaxX,padMaxY);
    finishChange();notify('Замкнутая область залита на активном слое');return true
  }
  function fillAt(p){
    const frameObjects=currentObjects(),found=[...frameObjects].reverse().find(object=>fillHit(p,object));
    if(found&&!hasOverlayAbove(p,found,frameObjects)){
      if(found.locked||layers.find(layer=>layer.id===found.layer)?.locked){notify('Нельзя изменить заливку на заблокированном слое');return}
      snapshot();found.fill=fillColor.value;found.fillEnabled=true;delete found.fillGradient;finishChange();notify('Заливка объекта изменена');return
    }
    fillClosedRegion(p,frameObjects)
  }
  function beginRotationControl(p){
    for(const object of currentSelection()){
      if(object.locked||layers.find(layer=>layer.id===object.layer)?.locked)continue;
      const b=objectBounds(object),cx=b.x+b.w/2,cy=b.y+b.h/2,rotation=-(object.rotation||0)*Math.PI/180;
      const dx=p.x-cx,dy=p.y-cy,local={x:cx+dx*Math.cos(rotation)-dy*Math.sin(rotation),y:cy+dx*Math.sin(rotation)+dy*Math.cos(rotation)};
      const controls=rotationControlLayout(b.x-6,b.y-6,b.w+12);
      if(Math.hypot(local.x-controls.left.x,local.y-controls.left.y)<=controls.radius){rotateSelection(-15);return true}
      if(Math.hypot(local.x-controls.right.x,local.y-controls.right.y)<=controls.radius){rotateSelection(15);return true}
    }
    if(selectedIds.size!==1||!selectedId)return false;
    const object=objects.find(item=>item.id===selectedId);
    if(!object||object.locked||layers.find(layer=>layer.id===object.layer)?.locked)return false;
    const b=objectBounds(object),cx=b.x+b.w/2,cy=b.y+b.h/2,rotation=object.rotation||0;
    const dx=p.x-cx,dy=p.y-cy,r=-rotation*Math.PI/180;
    const local={x:cx+dx*Math.cos(r)-dy*Math.sin(r),y:cy+dx*Math.sin(r)+dy*Math.cos(r)};
    const controls=rotationControlLayout(b.x-6,b.y-6,b.w+12);
    if(Math.hypot(local.x-controls.rotate.x,local.y-controls.rotate.y)>controls.radius)return false;
    transformState={object,handle:'rotate',original:JSON.parse(JSON.stringify(object)),bounds:b,center:{x:cx,y:cy},pointerAngle:Math.atan2(p.y-cy,p.x-cx),startRotation:Number(object.rotation)||0};
    snapshot();return true
  }
  canvas.addEventListener('pointerdown',e=>{
    if(e.button===1||spacePanning){e.preventDefault();return}
    if(e.button!==0)return;
    let p=point(e);canvas.setPointerCapture(e.pointerId);
    if(tool==='select'&&beginRotationControl(p))return;
    if(!['select','eyedropper','fill','lasso','magic','blur'].includes(tool)&&layers.find(layer=>layer.id===activeLayer)?.locked){notify('Активный слой заблокирован');return}
    if(tool==='lasso'){
      lassoSelection={points:[p],mode:e.altKey?'subtract':e.shiftKey?'add':e.ctrlKey||e.metaKey?'toggle':'replace'};
      return
    }
    if(tool==='select'||tool==='eyedropper'){
      let found=[...currentObjects()].reverse().find(o=>hit(p,o));
      if(tool==='eyedropper'&&found){strokeColor.value=found.stroke||'#24242a';return}
      if(tool==='select'&&found?.generatedTween&&!layers.find(layer=>layer.id===found.layer)?.locked){
        snapshot();
        const key=cloneObjectToFrame(found,currentFrame);
        objects.push(key);found=key;finishChange();
      }
      if(tool==='select'&&selectedIds.size===1&&selectedId&&!e.ctrlKey&&!e.metaKey){
        const o=objects.find(x=>x.id===selectedId);
        if(o&&!o.locked&&!layers.find(layer=>layer.id===o.layer)?.locked){
          const b=objectBounds(o),rotation=o.rotation||0;
          const cx=b.x+b.w/2,cy=b.y+b.h/2;
          const toLocal=q=>{const dx=q.x-cx,dy=q.y-cy,r=-rotation*Math.PI/180;return {x:cx+dx*Math.cos(r)-dy*Math.sin(r),y:cy+dx*Math.sin(r)+dy*Math.cos(r)}};
          const lp=toLocal(p),x=b.x-6,y=b.y-6,w=b.w+12,h=b.h+12;
          const handles=[['nw',x,y],['n',x+w/2,y],['ne',x+w,y],['e',x+w,y+h/2],['se',x+w,y+h],['s',x+w/2,y+h],['sw',x,y+h],['w',x,y+h/2]];
          const handle=handles.find(([,hx,hy])=>Math.abs(lp.x-hx)<=8&&Math.abs(lp.y-hy)<=8);
          if(handle){transformState={object:o,handle:handle[0],original:JSON.parse(JSON.stringify(o)),bounds:b,center:{x:cx,y:cy}};snapshot();return}
        }
      }
      const preserveMultiSelection=Boolean(found&&selectedIds.size>1&&selectedIds.has(found.id)&&!e.ctrlKey&&!e.metaKey);
      if(e.ctrlKey||e.metaKey){
        markLearningComplete('Попробовать Ctrl+ЛКМ');
        if(found){if(selectedIds.has(found.id))selectedIds.delete(found.id);else selectedIds.add(found.id);selectedId=selectedIds.has(found.id)?found.id:(selectedIds.size?[...selectedIds].pop():null)}
        else if(!found){selectedId=selectedIds.size?[...selectedIds].pop():null}
      }else if(preserveMultiSelection){
        selectedId=found.id;
      }else{
        if(found){selectedIds.clear();selectedIds.add(found.id);selectedId=found.id}else{selectedIds.clear();selectedId=null;marquee={start:p,end:p}}
      }
      if(found){
        activeLayer=found.layer;renderLayers();
        if(selectedIds.has(found.id)){
          const selection=selectedIds.size>1?currentSelection():[found];
          const movable=selection.filter(object=>!object.locked&&!layers.find(layer=>layer.id===object.layer)?.locked);
          if(movable.length!==selection.length)notify('Заблокированные объекты нельзя перемещать');
          if(movable.length){movingObject=movable.length===1?movable[0]:movable;moveLast=p;movingDirty=false}
        }
      }render();return
    }
    if(tool==='fill'){fillAt(p);return}
    if(tool==='text'){openTextEditor(snapPoint(p));return}
    if(tool==='magic'){notify('Быстрое выделение ещё не реализовано');return}
    if(tool==='blur'){
      const editable=currentObjects().filter(o=>!o.isEraser&&o.type!=='eraser'&&!o.generatedTween&&!o.locked&&!layers.find(layer=>layer.id===o.layer)?.locked);
      if(!editable.length){notify('На кадре нет разблокированных объектов для размытия');return}
      blurStroke={points:[p]};render();return
    }
    const freehandTool=['brush','pencil','eraser'].includes(tool);
    p=snapPoint(p);drawing=true;start=p;const shapeType=freehandTool?'stroke':tool;
    const pointerPressure=$('pressure').checked&&e.pointerType!=='mouse'?e.pressure:1;
    preview={id:crypto.randomUUID(),type:shapeType,isEraser:tool==='eraser'||undefined,x:p.x,y:p.y,x2:p.x,y2:p.y,points:[{...p,pressure:pointerPressure}],pressureEnabled:$('pressure').checked,stroke:tool==='eraser'?'#000000':strokeColor.value,fill:$('fillEnabled').checked?fillColor.value:'transparent',fillEnabled:$('fillEnabled').checked,fillGradient:$('fillEnabled').checked&&settings.fill_gradient_enabled?gradientForObject():undefined,strokeEnabled:true,width:freehandTool?Math.max(1,Math.min(80,Number($('brushSize').value)||8)):Number($('strokeWidth').value),opacity:Number($('opacity').value),dash:$('strokeStyle').value==='solid'?'solid':$('strokeStyle').value,shadowEnabled:settings.shadow_enabled===true,shadowColor:settings.shadow_color,layer:activeLayer,frame:currentFrame};
    if(shapeType==='rect'||shapeType==='roundrect')preview.cornerRadius=shapeType==='roundrect'?18:0;
  });
  $('canvasStage').addEventListener('pointerdown',event=>{
    if(event.button!==1&&!spacePanning)return;
    event.preventDefault();panState={pointerId:event.pointerId,x:event.clientX,y:event.clientY,origin:{...panOffset}};
    $('canvasStage').setPointerCapture(event.pointerId);$('canvasStage').classList.add('panning')
  });
  $('canvasStage').addEventListener('pointermove',event=>{
    if(!panState||event.pointerId!==panState.pointerId)return;
    panOffset={x:panState.origin.x+event.clientX-panState.x,y:panState.origin.y+event.clientY-panState.y};applyZoom()
  });
  const stopPanning=event=>{
    if(!panState||event.pointerId!==panState.pointerId)return;
    panState=null;$('canvasStage').classList.remove('panning');
    if($('canvasStage').hasPointerCapture(event.pointerId))$('canvasStage').releasePointerCapture(event.pointerId)
  };
  $('canvasStage').addEventListener('pointerup',stopPanning);$('canvasStage').addEventListener('pointercancel',stopPanning);
  window.addEventListener('keydown',event=>{
    if(event.code==='Space'&&!/INPUT|TEXTAREA|SELECT/.test(event.target?.tagName||'')){spacePanning=true;$('canvasStage').classList.add('space-pan');event.preventDefault()}
  });
  window.addEventListener('keyup',event=>{if(event.code==='Space'){spacePanning=false;$('canvasStage').classList.remove('space-pan')}});
  window.addEventListener('blur',()=>{spacePanning=false;$('canvasStage').classList.remove('space-pan')});
  canvas.addEventListener('pointermove',e=>{
    const p=point(e);
    if(blurStroke){
      const previous=blurStroke.points[blurStroke.points.length-1];
      if(Math.hypot(p.x-previous.x,p.y-previous.y)>=2)blurStroke.points.push(p);
      scheduleRender();return
    }
    if(transformState){
      const t=transformState,o=t.object,original=t.original,b=t.bounds,resizePoint=snapPoint(p);
      if(t.handle==='rotate'){
        const angle=Math.atan2(p.y-t.center.y,p.x-t.center.x),delta=Math.atan2(Math.sin(angle-t.pointerAngle),Math.cos(angle-t.pointerAngle))*180/Math.PI;
        o.rotation=(t.startRotation+delta+360)%360;
      }else{
        let left=b.x,right=b.x+b.w,top=b.y,bottom=b.y+b.h;
        if(t.handle.includes('w'))left=resizePoint.x;
        if(t.handle.includes('e'))right=resizePoint.x;
        if(t.handle.includes('n'))top=resizePoint.y;
        if(t.handle.includes('s'))bottom=resizePoint.y;
        if(e.shiftKey){const sw=Math.abs(right-left),sh=Math.abs(bottom-top),side=Math.max(sw,sh);if(t.handle.includes('w'))left=right-side;else right=left+side;if(t.handle.includes('n'))top=bottom-side;else bottom=top+side}
        left=Math.min(left,right);right=Math.max(left,right);top=Math.min(top,bottom);bottom=Math.max(top,bottom);
        if(right-left<12)right=left+12;if(bottom-top<12)bottom=top+12;
        const newW=right-left,newH=bottom-top,sx=newW/Math.max(1,b.w),sy=newH/Math.max(1,b.h);
        if(original.type==='stroke'||original.type==='blur'||original.type==='eraser'){
          o.points=(original.points||[]).map(q=>({x:left+(q.x-b.x)*sx,y:top+(q.y-b.y)*sy,pressure:q.pressure}));
          o.width=(original.width||8)*Math.max(sx,sy);
        }else if(original.type==='text'){
          o.x=left;o.y=top;o.textSize=Math.max(8,(original.textSize||36)*sy);o.x2=left+newW;o.y2=top+newH;
        }else{o.x=left;o.y=top;o.x2=right;o.y2=bottom}
        if(original.blurEffects)o.blurEffects=original.blurEffects.map(effect=>({...effect,strokes:(effect.strokes||[]).map(points=>points.map(point=>({x:left+(point.x-b.x)*sx,y:top+(point.y-b.y)*sy})))}));
      }
      scheduleRender();return;
    }
    if(lassoSelection){
      const previous=lassoSelection.points[lassoSelection.points.length-1];
      if(Math.hypot(p.x-previous.x,p.y-previous.y)>=2)lassoSelection.points.push(p);
      scheduleRender();return
    }
    if(marquee){marquee.end=p;scheduleRender();return}
    if(movingObject&&moveLast){
      let dx=p.x-moveLast.x,dy=p.y-moveLast.y;
      const selection=Array.isArray(movingObject)?movingObject:[movingObject];
      if(settings.grid_snap_enabled&&(dx||dy)){
        let left=Infinity,top=Infinity;
        for(const object of selection){const bounds=objectBounds(object);left=Math.min(left,bounds.x);top=Math.min(top,bounds.y)}
        const target=snapPoint({x:left+dx,y:top+dy});
        dx=target.x-left;dy=target.y-top
      }
      if(dx||dy){
        if(!movingDirty){snapshot();movingDirty=true}
        selection.forEach(object=>{if(object.type==='stroke'||object.type==='blur'||object.type==='eraser')object.points.forEach(q=>{q.x+=dx;q.y+=dy});else{object.x+=dx;object.y+=dy;if(object.x2!==undefined){object.x2+=dx;object.y2+=dy}}translateBlurEffects(object,dx,dy)})
      }
      moveLast=p;scheduleRender();return
    }
    if(!drawing||!preview)return;const drawPoint=snapPoint(p);if(preview.type==='stroke'){const previous=preview.points[preview.points.length-1];const liveSmooth=settings.curve_smoothing_enabled&&!['off','manual'].includes(settings.curve_smoothing)&&!settings.grid_snap_enabled;const minDist=liveSmooth?Math.max(1.5,Math.min(4,(Number(settings.smoothing_jitter_threshold)||6)*.3)):0;if(Math.hypot(drawPoint.x-previous.x,drawPoint.y-previous.y)>minDist){const pr=$('pressure').checked&&e.pointerType!=='mouse'?e.pressure:1;if(liveSmooth&&preview.points.length>1){const alpha=.65;preview.points.push({x:previous.x+(drawPoint.x-previous.x)*alpha,y:previous.y+(drawPoint.y-previous.y)*alpha,pressure:pr})}else preview.points.push({...drawPoint,pressure:pr})}}else{let dx=drawPoint.x-start.x,dy=drawPoint.y-start.y;if(e.shiftKey&&['rect','roundrect','ellipse','triangle','polygon','star'].includes(preview.type)){const side=Math.max(Math.abs(dx),Math.abs(dy));dx=Math.sign(dx||1)*side;dy=Math.sign(dy||1)*side}else if(e.shiftKey&&preview.type==='line'){const angleIndex=Math.round(Math.atan2(dy,dx)/(Math.PI/4)),direction=(angleIndex%8+8)%8,angle=direction*(Math.PI/4),distance=Math.hypot(dx,dy);if(settings.grid_snap_enabled){if(direction%2===0){const step=Math.max(10,Number(settings.grid_size)||100),length=Math.round(distance/step)*step,vectors=[[1,0],[0,1],[-1,0],[0,-1]],[vx,vy]=vectors[(direction/2)%4];dx=vx*length;dy=vy*length}else{const step=Math.max(10,Number(settings.grid_size)||100),cells=Math.round(distance/(step*Math.SQRT2)),vectors=[[1,1],[-1,1],[-1,-1],[1,-1]],[vx,vy]=vectors[(direction-1)/2];dx=vx*cells*step;dy=vy*cells*step}}else{dx=Math.cos(angle)*distance;dy=Math.sin(angle)*distance}}preview.x2=start.x+dx;preview.y2=start.y+dy}scheduleRender();
  });
  canvas.addEventListener('pointerup',()=>{
    if(blurStroke){
      const stroke=blurStroke;blurStroke=null;
      const radius=Math.max(1,Math.min(80,Number($('blurRadius').value)||8)),size=Math.max(1,Math.min(80,Number($('brushSize').value)||8));
      const pad=size/2+radius+8;
      const targets=currentObjects().filter(object=>{
        if(object.isEraser||object.type==='eraser'||object.generatedTween||object.locked||layers.find(layer=>layer.id===object.layer)?.locked)return false;
        const b=objectBounds(object);
        return stroke.points.some(pt=>pt.x>=b.x-pad&&pt.x<=b.x+b.w+pad&&pt.y>=b.y-pad&&pt.y<=b.y+b.h+pad)
      });
      if(!targets.length){render();return}
      snapshot();
      targets.forEach(target=>{
        target.blurEffects=Array.isArray(target.blurEffects)?target.blurEffects:[];
        target.blurEffects.push({radius,size,strokes:[stroke.points]});
        if(target.blurEffects.length>24)target.blurEffects.shift()
      });
      selectedIds=new Set(targets.map(t=>t.id));selectedId=targets[targets.length-1].id;markLearningComplete('Размыть объект');finishChange();return
    }
    if(transformState){transformState=null;finishChange();return}
    if(lassoSelection){
      const {points,mode}=lassoSelection;lassoSelection=null;
      if(points.length>=3){
        const matches=currentObjects().filter(object=>lassoIntersectsObject(points,object)).map(object=>object.id);
        if(mode==='replace')selectedIds=new Set(matches);
        else if(mode==='add')matches.forEach(id=>selectedIds.add(id));
        else if(mode==='subtract')matches.forEach(id=>selectedIds.delete(id));
        else matches.forEach(id=>selectedIds.has(id)?selectedIds.delete(id):selectedIds.add(id));
        selectedId=selectedIds.size?[...selectedIds].pop():null;
        materializeGeneratedSelection();
      }
      render();return
    }
    if(marquee){
      const r=marquee,x1=Math.min(r.start.x,r.end.x),y1=Math.min(r.start.y,r.end.y),x2=Math.max(r.start.x,r.end.x),y2=Math.max(r.start.y,r.end.y);
      selectedIds.clear();
      if(x2-x1>3||y2-y1>3)currentObjects().forEach(o=>{const b=objectBounds(o);if(b.x+b.w>=x1&&b.x<=x2&&b.y+b.h>=y1&&b.y<=y2)selectedIds.add(o.id)});
      selectedId=selectedIds.size?selectedIds.values().next().value:null;marquee=null;materializeGeneratedSelection();render();return;
    }
    if(movingObject){movingObject=null;moveLast=null;if(movingDirty)finishChange();movingDirty=false;return}
    if(!drawing||!preview)return;drawing=false;const isStroke=preview.type==='stroke';const committed=isStroke&&!preview.isEraser?snapStrokeToGrid(smoothStroke(preview)):preview;preview=null;
    if(committed.isEraser){
      const eb=objectBounds(committed),pad=Math.max(4,(committed.width||8)/2);
      const hitsLayer=currentObjects().some(o=>o.layer===activeLayer&&!o.isEraser&&o.type!=='eraser'&&(()=>{const b=objectBounds(o);return !(b.x+b.w+pad<eb.x||b.x-pad>eb.x+eb.w||b.y+b.h+pad<eb.y||b.y-pad>eb.y+eb.h)})());
      if(!hitsLayer){render();return}
      snapshot();objects.push(committed);selectedIds.clear();selectedId=null;finishChange();return
    }
    snapshot();objects.push(committed);selectedIds=new Set([committed.id]);selectedId=committed.id;markLearningComplete(isStroke?'Выбрать инструмент':'Нарисовать фигуру');finishChange();
  });
  canvas.addEventListener('pointercancel',()=>{if(blurStroke){blurStroke=null;render()}});
  function finishChange(){
    clearRenderCaches();
    for(const layerId of new Set(objects.filter(object=>object.frame===currentFrame).map(object=>object.layer)))setBlankKeyframe(layerId,currentFrame,false);
    save();render();updateTimeline();renderLayers();syncEditorControls();
    if(apiReady&&currentProjectId&&multiplayerUserId){
      fetch('/api/multiplayer/changes/record',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        project_id:currentProjectId,user_id:multiplayerUserId,revision:projectRevision+1,
        action:'project_update',payload:{frame:currentFrame,object_count:objects.length}
      })}).catch(error=>console.warn('Could not record collaboration change',error));
    }
  }
  function currentSelection(){const ids=selectedIds.size?selectedIds:new Set(selectedId?[selectedId]:[]);return objects.filter(object=>ids.has(object.id))}
  function selectionContents(selection=currentSelection()){
    return selection.flatMap(object=>object.type==='group'?(Array.isArray(object.children)?object.children.flatMap(child=>selectionContents([child])):[]):[object])
  }
  function groupSelectionError(selection=currentSelection()){
    if(selection.length<2)return 'Выберите минимум два объекта для группировки';
    const frame=selection[0].frame,layer=selection[0].layer;
    if(selection.some(object=>object.frame!==frame||object.frame!==currentFrame))return 'Для группировки выберите объекты одного текущего кадра';
    if(selection.some(object=>object.layer!==layer))return 'Для группировки выберите объекты одного слоя';
    if(selection.some(object=>object.locked)||layers.find(item=>item.id===layer)?.locked)return 'Разблокируйте выбранные объекты и слой';
    if(selection.some(objectContainsEraser))return 'Ластик нельзя включить в группу';
    return ''
  }
  function groupSelection(){
    const selection=currentSelection(),error=groupSelectionError(selection);
    if(error){notify(error);return}
    const ids=new Set(selection.map(object=>object.id)),maxIndex=Math.max(...selection.map(object=>objects.indexOf(object)));
    const insertIndex=objects.slice(0,maxIndex).filter(object=>!ids.has(object.id)).length;
    const bounds=selection.map(objectBounds),left=Math.min(...bounds.map(item=>item.x)),top=Math.min(...bounds.map(item=>item.y));
    const right=Math.max(...bounds.map(item=>item.x+item.w)),bottom=Math.max(...bounds.map(item=>item.y+item.h));
    const width=Math.max(1,right-left),height=Math.max(1,bottom-top),layer=selection[0].layer,frame=selection[0].frame;
    const children=selection.map(object=>JSON.parse(JSON.stringify(object)));
    children.forEach(child=>{translateObjectGeometry(child,-left,-top);setObjectLayerAndFrame(child,layer,frame)});
    const group={id:crypto.randomUUID(),type:'group',name:'Группа',x:left,y:top,x2:left+width,y2:top+height,baseWidth:width,baseHeight:height,children,opacity:100,rotation:0,fillEnabled:false,strokeEnabled:false,width:0,layer,frame};
    snapshot();objects=objects.filter(object=>!ids.has(object.id));objects.splice(insertIndex,0,group);
    selectedIds=new Set([group.id]);selectedId=group.id;finishChange();notify(`Сгруппировано объектов: ${children.length}`)
  }
  function rotatePointAround(point,center,radians){
    const dx=point.x-center.x,dy=point.y-center.y,cos=Math.cos(radians),sin=Math.sin(radians);
    return {x:center.x+dx*cos-dy*sin,y:center.y+dx*sin+dy*cos}
  }
  function transformGroupedChild(object,group){
    const groupBounds=objectBounds(group),baseWidth=Math.max(1,Number(group.baseWidth)||groupBounds.w||1),baseHeight=Math.max(1,Number(group.baseHeight)||groupBounds.h||1);
    const scaleX=groupBounds.w/baseWidth,scaleY=groupBounds.h/baseHeight,angle=(Number(group.rotation)||0)*Math.PI/180;
    const groupCenter={x:groupBounds.x+groupBounds.w/2,y:groupBounds.y+groupBounds.h/2},localBounds=objectBounds(object);
    const localCenter={x:localBounds.x+localBounds.w/2,y:localBounds.y+localBounds.h/2},objectAngle=(Number(object.rotation)||0)*Math.PI/180;
    const scaledCenter={x:groupBounds.x+localCenter.x*scaleX,y:groupBounds.y+localCenter.y*scaleY};
    const worldCenter=rotatePointAround(scaledCenter,groupCenter,angle);
    const transformPoint=point=>{
      const objectLocal=rotatePointAround(point,localCenter,objectAngle);
      const scaled={x:groupBounds.x+objectLocal.x*scaleX,y:groupBounds.y+objectLocal.y*scaleY};
      return rotatePointAround(scaled,groupCenter,angle)
    };
    if(object.type==='line'){
      const start=transformPoint({x:object.x,y:object.y}),end=transformPoint({x:object.x2,y:object.y2});
      object.x=start.x;object.y=start.y;object.x2=end.x;object.y2=end.y;object.rotation=0
    }else if(['stroke','blur','eraser'].includes(object.type)){
      object.points=(object.points||[]).map(transformPoint);
      object.width=(Number(object.width)||8)*Math.sqrt(Math.abs(scaleX*scaleY));object.rotation=0
    }else{
      const width=localBounds.w*scaleX,height=localBounds.h*scaleY;
      if(object.type==='text'){
        object.x=worldCenter.x-width/2;object.y=worldCenter.y-height/2;
        object.textSize=Math.max(8,(Number(object.textSize)||36)*scaleY);
        object.textScaleX=Math.max(.01,(Number(object.textScaleX)||1)*scaleX/scaleY)
      }else{
        object.x=worldCenter.x-width/2;object.y=worldCenter.y-height/2;
        object.x2=worldCenter.x+width/2;object.y2=worldCenter.y+height/2
      }
      if(object.type==='roundrect'&&Number.isFinite(Number(object.cornerRadius)))object.cornerRadius*=Math.sqrt(Math.abs(scaleX*scaleY));
      object.width=(Number(object.width)||0)*Math.sqrt(Math.abs(scaleX*scaleY));
      object.rotation=((Number(object.rotation)||0)+(Number(group.rotation)||0)+360)%360
    }
    object.blurEffects?.forEach(effect=>effect.strokes?.forEach(points=>points.forEach((point,index)=>{points[index]=transformPoint(point)})));
    setObjectLayerAndFrame(object,group.layer,group.frame);
    const inheritedEffects=Array.isArray(group.blurEffects)?group.blurEffects:[];
    if(inheritedEffects.length)object.blurEffects=[...(object.blurEffects||[]),...JSON.parse(JSON.stringify(inheritedEffects))];
    if(group.filter&&!object.filter)object.filter=group.filter;
    if(group.shadowEnabled===true){object.shadowEnabled=true;object.shadowColor=group.shadowColor||object.shadowColor}
    object.opacity=(Number(object.opacity??100)||0)*(Number(group.opacity??100)||0)/100;
    return object
  }
  function ungroupSelection(){
    const selection=currentSelection(),group=selection.length===1&&selection[0].type==='group'?selection[0]:null;
    if(!group){notify('Выберите одну группу для разгруппировки');return}
    if(group.locked||layers.find(layer=>layer.id===group.layer)?.locked){notify('Разблокируйте группу и её слой');return}
    const children=(Array.isArray(group.children)?group.children:[]).map(child=>transformGroupedChild(JSON.parse(JSON.stringify(child)),group));
    if(!children.length){notify('В группе нет объектов');return}
    const index=objects.indexOf(group);
    snapshot();objects.splice(index,1,...children);selectedIds=new Set(children.map(object=>object.id));selectedId=children[0].id;
    finishChange();notify(`Разгруппировано объектов: ${children.length}`)
  }
  function materializeGeneratedSelection(){
    const generated=currentObjects().filter(object=>selectedIds.has(object.id)&&object.generatedTween&&!layers.find(layer=>layer.id===object.layer)?.locked);
    if(!generated.length)return;
    snapshot();
    for(const object of generated){
      const key={...JSON.parse(JSON.stringify(object)),id:crypto.randomUUID(),generatedTween:undefined};
      objects.push(key);selectedIds.delete(object.id);selectedIds.add(key.id);
      if(selectedId===object.id)selectedId=key.id
    }
    finishChange()
  }
  function selectAll(){selectedIds=new Set(currentObjects().map(object=>object.id));selectedId=selectedIds.values().next().value||null;materializeGeneratedSelection();render()}
  function clearSelection(){selectedIds.clear();selectedId=null;render()}
  function deleteSelection(){const selection=currentSelection();if(!selection.length)return;const ids=new Set(selection.map(object=>object.id));snapshot();objects=objects.filter(object=>!ids.has(object.id));selectedIds.clear();selectedId=null;finishChange()}
  function cloneSelection(offset=18){const selection=currentSelection();if(!selection.length)return;const clones=selection.map(object=>{const clone=refreshObjectIds(JSON.parse(JSON.stringify(object)));setObjectLayerAndFrame(clone,activeLayer,currentFrame);translateObjectGeometry(clone,offset,offset);return clone});snapshot();objects.push(...clones);selectedIds=new Set(clones.map(object=>object.id));selectedId=clones[0].id;finishChange()}
  function copySelection(cut=false){const selection=currentSelection();if(!selection.length){notify('Сначала выделите объект');return}clipboard=JSON.parse(JSON.stringify(selection));try{localStorage.setItem('floxzert-clipboard',JSON.stringify(clipboard))}catch(error){console.warn('Could not cache clipboard',error)}if(cut)deleteSelection();else notify(`${clipboard.length} объект(а) скопировано`)}
  function pasteSelection(){if(!clipboard.length){try{clipboard=JSON.parse(localStorage.getItem('floxzert-clipboard')||'[]')}catch(error){console.warn('Could not read cached clipboard',error);clipboard=[]}}if(!clipboard.length){notify('Буфер FloxZert пуст');return}const clones=clipboard.map(object=>{const clone=refreshObjectIds(JSON.parse(JSON.stringify(object)));setObjectLayerAndFrame(clone,activeLayer,currentFrame);translateObjectGeometry(clone,18,18);return clone});snapshot();objects.push(...clones);selectedIds=new Set(clones.map(object=>object.id));selectedId=clones[0].id;finishChange()}
  function moveSelectionInStack(direction){
    const selection=currentSelection();
    if(!selection.length){notify('Сначала выделите объект');return}
    snapshot();
    const ids=new Set(selection.map(object=>object.id));
    const selected=objects.filter(object=>ids.has(object.id));
    if(direction==='front'){objects=objects.filter(object=>!ids.has(object.id));objects.push(...selected)}
    else if(direction==='back'){objects=objects.filter(object=>!ids.has(object.id));objects.unshift(...selected)}
    else if(direction==='forward'){for(let i=objects.length-2;i>=0;i--)if(ids.has(objects[i].id)&&!ids.has(objects[i+1].id))[objects[i],objects[i+1]]=[objects[i+1],objects[i]]}
    else if(direction==='backward'){for(let i=1;i<objects.length;i++)if(ids.has(objects[i].id)&&!ids.has(objects[i-1].id))[objects[i],objects[i-1]]=[objects[i-1],objects[i]]}
    finishChange();
  }
  function isFillableObject(object){return ['rect','roundrect','ellipse','triangle','polygon','star','text'].includes(object.type)}
  function editableSelection(selection=currentSelection()){return selection.filter(object=>!object.locked&&!layers.find(layer=>layer.id===object.layer)?.locked)}
  function syncSelectionFillControls(){
    const selection=selectionContents(currentSelection()).filter(isFillableObject),states=selection.length?selection.map(object=>object.fillEnabled!==false):[settings.default_fill_enabled!==false],enabled=states.some(Boolean),mixed=states.some(state=>state!==states[0]);
    ['fillEnabled','panelFill'].forEach(id=>{$(id).checked=enabled;$(id).indeterminate=mixed})
  }
  function setSelectionFillEnabled(enabled){
    const selection=currentSelection();
    if(!selection.length){settings.default_fill_enabled=enabled;$('fillEnabled').checked=enabled;$('panelFill').checked=enabled;save();return}
    const fillable=selectionContents(selection).filter(isFillableObject),editable=editableSelection(fillable);
    if(!fillable.length){notify('Выберите фигуру с заливкой');syncSelectionFillControls();return}
    if(!editable.length){notify('Заливка заблокирована на выбранном слое');syncSelectionFillControls();return}
    snapshot();editable.forEach(object=>object.fillEnabled=enabled);finishChange();
    if(editable.length<fillable.length)notify('Часть фигур пропущена: слой или объект заблокирован')
  }
  function toggleSelectionFill(){
    const selection=currentSelection();
    if(!selection.length){setSelectionFillEnabled(!settings.default_fill_enabled);return}
    const fillable=selectionContents(selection).filter(isFillableObject);
    if(!fillable.length){notify('Выберите фигуру с заливкой');return}
    setSelectionFillEnabled(fillable.some(object=>object.fillEnabled===false))
  }
  function setSelectionStrokeEnabled(enabled){
    const selection=selectionContents(currentSelection()),editable=editableSelection(selection);
    if(!selection.length){notify('Сначала выделите объект');return}
    if(!editable.length){notify('Обводка заблокирована на выбранном слое');return}
    snapshot();editable.forEach(object=>{object.strokeEnabled=enabled;if(enabled&&!(object.width>0))object.width=Number($('strokeWidth').value)});finishChange();
    if(editable.length<selection.length)notify('Часть объектов пропущена: слой или объект заблокирован')
  }
  function toggleSelectionStroke(){
    const selection=selectionContents(currentSelection());
    if(!selection.length){notify('Сначала выделите объект');return}
    setSelectionStrokeEnabled(selection.some(object=>object.strokeEnabled===false))
  }
  function removeSelectionFill(){
    const selection=currentSelection(),fillable=selectionContents(selection).filter(isFillableObject),editable=editableSelection(fillable);
    if(!selection.length){notify('Сначала выделите объект');return}
    if(!fillable.length){notify('У выбранного элемента нет заливки');return}
    if(!editable.length){notify('Заливка заблокирована на выбранном слое');return}
    snapshot();editable.forEach(object=>{object.fillEnabled=false;delete object.fillGradient});finishChange();
    if(editable.length<fillable.length)notify('Часть фигур пропущена: слой или объект заблокирован')
  }
  function removeSelectionStroke(){
    const selection=selectionContents(currentSelection()),editable=editableSelection(selection);
    if(!selection.length){notify('Сначала выделите объект');return}
    if(!editable.length){notify('Обводка заблокирована на выбранном слое');return}
    snapshot();editable.forEach(object=>{object.strokeEnabled=false;object.width=0});finishChange();
    if(editable.length<selection.length)notify('Часть объектов пропущена: слой или объект заблокирован')
  }
  function toggleSelectionLock(){
    const selection=currentSelection();
    if(!selection.length){notify('Сначала выделите объект');return}
    snapshot();
    const lock=selection.some(object=>object.locked!==true);
    selection.forEach(object=>object.locked=lock);
    finishChange();notify(lock?'Объект заблокирован':'Объект разблокирован');
  }
  function hideCanvasContextMenu(){const menu=$('canvasContextMenu');if(menu)menu.classList.add('hidden')}
  function showCanvasContextMenu(clientX,clientY,onObject){
    const menu=$('canvasContextMenu');
    const selection=currentSelection(),groupButton=menu.querySelector('[data-context-action="group"]'),ungroupButton=menu.querySelector('[data-context-action="ungroup"]');
    const groupError=groupSelectionError(selection),selectedGroup=selection.length===1&&selection[0].type==='group';
    groupButton.disabled=Boolean(groupError);groupButton.title=groupError||'Собрать выделенные объекты в одну группу';
    ungroupButton.disabled=!selectedGroup||Boolean(selectedGroup&&(selection[0].locked||layers.find(layer=>layer.id===selection[0].layer)?.locked));
    ungroupButton.title=selectedGroup?'Вернуть объекты из группы на холст':'Выберите одну группу';
    menu.classList.remove('hidden');
    menu.classList.toggle('context-on-object',onObject);
    menu.classList.toggle('context-on-empty',!onObject);
    const pad=8,maxLeft=window.innerWidth-menu.offsetWidth-pad,maxTop=window.innerHeight-menu.offsetHeight-pad;
    menu.style.left=`${Math.max(pad,Math.min(clientX,maxLeft))}px`;
    menu.style.top=`${Math.max(pad,Math.min(clientY,maxTop))}px`;
  }
  canvas.addEventListener('contextmenu',event=>{
    event.preventDefault();
    const p=point(event);
    const found=[...currentObjects()].reverse().find(object=>hit(p,object));
    if(found){
      if(!selectedIds.has(found.id)){
        selectedIds.clear();selectedIds.add(found.id);selectedId=found.id;activeLayer=found.layer;renderLayers();
      }
    }else{
      if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey){selectedIds.clear();selectedId=null}
    }
    render();showCanvasContextMenu(event.clientX,event.clientY,Boolean(found));
  });
  $('canvasContextMenu').addEventListener('click',event=>{
    const button=event.target.closest('[data-context-action]');
    if(!button)return;
    const action=button.dataset.contextAction;
    hideCanvasContextMenu();
    if(action==='copy')copySelection();
    else if(action==='cut')copySelection(true);
    else if(action==='paste')pasteSelection();
    else if(action==='duplicate')cloneSelection();
    else if(action==='group')groupSelection();
    else if(action==='ungroup')ungroupSelection();
    else if(action==='delete')deleteSelection();
    else if(action==='select-all')selectAll();
    else if(action==='motion-tween')$('createMotionTween').click();
    else if(action==='keyframe')$('addLayerKeyframe').click();
    else if(action==='blank-keyframe')$('addBlankKeyframe').click();
    else if(action==='front')moveSelectionInStack('front');
    else if(action==='forward')moveSelectionInStack('forward');
    else if(action==='backward')moveSelectionInStack('backward');
    else if(action==='back')moveSelectionInStack('back');
    else if(action==='toggle-fill')toggleSelectionFill();
    else if(action==='remove-fill')removeSelectionFill();
    else if(action==='toggle-stroke')toggleSelectionStroke();
    else if(action==='remove-stroke')removeSelectionStroke();
    else if(action==='lock')toggleSelectionLock();
    else if(action==='toolbox'){
      if(!$('openSocial'))return;
      $('openSocial').click();
      $('addToolboxFromSelection').click();
    }
  });
  document.addEventListener('pointerdown',event=>{
    if(!$('canvasContextMenu').classList.contains('hidden')&&!event.target.closest('#canvasContextMenu'))hideCanvasContextMenu();
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape')hideCanvasContextMenu();
  });
  function executeShortcut(id){if(id==='tool-pressure'){setTool('brush');$('pressure').checked=!$('pressure').checked;return}const toolId=id.startsWith('tool-')?id.slice(5):null;if(toolId){setTool(toolId);return}
    switch(id){
      case'save':flushSave().then(()=>notify('Проект сохранён')).catch(error=>{notify('Не удалось сохранить проект');console.error(error)});break;
      case'saveAs':$('downloadProject').click();break;
      case'open':$('imageImport').click();break;
      case'newProject':$('projectSwitcher').click();break;
      case'undo':$('undoButton').click();break;
      case'redo':$('redoButton').click();break;
      case'copy':copySelection();break;
      case'cut':copySelection(true);break;
      case'paste':pasteSelection();break;
      case'duplicate':cloneSelection();break;
      case'delete':deleteSelection();break;
      case'selectAll':selectAll();break;
      case'deselect':clearSelection();break;
      case'commandPalette':openCommandPalette();break;
      case'settings':$('settingsButton').click();break;
      case'help':showShortcutHelp();break;
      case'zoom-fit':$('fitCanvas').click();break;
      case'zoom-actual':zoom=1;panOffset={x:0,y:0};$('canvasWrap').style.transformOrigin='center';applyZoom();break;
      case'zoom-in':$('zoomIn').click();break;
      case'zoom-out':$('zoomOut').click();break;
      case'grid-toggle':$('gridToggle').click();break;
      case'addFrame':$('addFrame').click();break;
      case'copyFrame':$('copyFrame').click();break;
      case'prevFrame':$('prevFrame').click();break;
      case'nextFrame':$('nextFrame').click();break;
      case'firstFrame':$('firstFrame').click();break;
      case'lastFrame':$('lastFrame').click();break;
      case'addKeyframe':$('addLayerKeyframe').click();break;
      case'addBlankKeyframe':$('addBlankKeyframe').click();break;
      case'clearLayerFrame':$('clearLayerFrame').click();break;
      case'frameMarker':$('addFrameMarker').click();break;
      case'toggleLoop':$('loopEnabled').click();break;
      case'play':$('playButton').click();break;
      case'onion':$('onionButton').click();break;
      case'addLayer':$('addLayer').click();break;
      case'toggleLayerLock':{const lock=$('layerList').querySelector('.layer-item.selected .layer-lock');if(lock)lock.click();else notify('Сначала выберите слой');break}
      case'rotateLeft':$('rotateLeft').click();break;
      case'rotateRight':$('rotateRight').click();break;
      case'toggleFill':toggleSelectionFill();break;
      case'toggleStroke':toggleSelectionStroke();break;
      case'fill':toggleSelectionFill();break;
      case'removeFill':removeSelectionFill();break;
      case'removeStroke':removeSelectionStroke();break;
      default:if(id.startsWith('opacity-')){const opacity=Number(id.slice(8)),selection=currentSelection();if(selection.length){snapshot();selection.forEach(object=>object.opacity=opacity);finishChange()}$('objectOpacity').value=opacity;$('objectOpacityValue').textContent=`${opacity}%`;break}
    }
  }
  function getShortcutBindings(item){const custom=settings.shortcuts[item.id];if(Array.isArray(custom))return custom.filter(key=>typeof key==='string').slice(0,MAX_SHORTCUTS_PER_ACTION);return item.keys}
  function getTotalShortcutBindings(){
    return shortcutDefaults.reduce((total,item)=>total+getShortcutBindings(item).length,0)
  }
  function isShortcutEnabled(item){return SYSTEM_SHORTCUT_IDS.has(item.id)||settings.shortcut_enabled[item.id]!==false}
  function getActiveShortcutBindings(item){return isShortcutEnabled(item)?getShortcutBindings(item):[]}
  function getShortcutOptions(item){
    const saved=settings.shortcut_options[item.id]||{};
    return {mode:SHORTCUT_MODES.includes(saved.mode)?saved.mode:'press',context:SHORTCUT_CONTEXTS.includes(saved.context)?saved.context:'global'}
  }
  function shortcutContextsOverlap(first,second){return first==='global'||second==='global'||first===second}
  function getShortcutContext(target){
    if(!(target instanceof Element))return 'global';
    if(target.closest('#assistantPanel'))return 'assistant';
    if(target.closest('.timeline'))return 'timeline';
    if(target.closest('#canvasStage'))return 'canvas';
    return 'global';
  }
  function clearPendingShortcutStates(){
    for(const pending of pendingShortcutHolds.values())clearTimeout(pending.timer);
    pendingShortcutHolds.clear();lastShortcutPresses.clear();
  }
  function cancelPendingShortcuts(itemId){
    const prefix=`${itemId}\u0000`;
    for(const [key,pending] of pendingShortcutHolds){if(key.startsWith(prefix)){clearTimeout(pending.timer);pendingShortcutHolds.delete(key)}}
    for(const key of lastShortcutPresses.keys())if(key.startsWith(prefix))lastShortcutPresses.delete(key);
  }
  function setShortcutOptions(item,property,value){
    const current=getShortcutOptions(item),next={...current,[property]:value};
    if(!SHORTCUT_MODES.includes(next.mode)||!SHORTCUT_CONTEXTS.includes(next.context))return;
    if(property==='context'&&isShortcutEnabled(item)){
      for(const binding of getShortcutBindings(item)){
        const conflict=shortcutDefaults.find(candidate=>candidate.id!==item.id&&isShortcutEnabled(candidate)&&shortcutContextsOverlap(next.context,getShortcutOptions(candidate).context)&&getShortcutBindings(candidate).includes(binding));
        if(conflict){notify(`Контекст конфликтует с действием «${conflict.title}» на сочетании ${binding}`);renderShortcutList();return}
      }
    }
    settings.shortcut_options[item.id]=next;
    cancelPendingShortcuts(item.id);save();
  }
  function setShortcutEnabled(item,enabled){
    if(SYSTEM_SHORTCUT_IDS.has(item.id))return;
    if(enabled){
      for(const binding of getShortcutBindings(item)){
        const context=getShortcutOptions(item).context;
        const conflict=shortcutDefaults.find(candidate=>candidate.id!==item.id&&isShortcutEnabled(candidate)&&shortcutContextsOverlap(context,getShortcutOptions(candidate).context)&&getShortcutBindings(candidate).includes(binding));
        if(conflict){notify(`Нельзя включить «${item.title}»: сочетание ${binding} уже используется действием «${conflict.title}»`);return}
      }
    }
    if(!enabled)cancelPendingShortcuts(item.id);
    settings.shortcut_enabled[item.id]=Boolean(enabled);save();renderShortcutList();
  }
  function enableAvailableShortcuts(){
    settings.shortcut_enabled=Object.fromEntries(shortcutDefaults.map(item=>[item.id,false]));
    let enabledCount=0;const conflicts=[];
    for(const item of shortcutDefaults){
      if(SYSTEM_SHORTCUT_IDS.has(item.id)){enabledCount++;continue}
      const context=getShortcutOptions(item).context;
      const conflict=shortcutDefaults.find(candidate=>candidate.id!==item.id&&isShortcutEnabled(candidate)&&shortcutContextsOverlap(context,getShortcutOptions(candidate).context)&&getShortcutBindings(candidate).some(binding=>getShortcutBindings(item).includes(binding)));
      if(conflict){conflicts.push(`${item.title} (${conflict.title})`);continue}
      settings.shortcut_enabled[item.id]=true;enabledCount++;
    }
    save();renderShortcutList();
    if(conflicts.length)notify(`Включено ${enabledCount} сочетаний; есть конфликты: ${conflicts.slice(0,3).join(', ')}${conflicts.length>3?' и другие':''}`);
    else notify('Все доступные горячие клавиши включены');
  }
  function removeShortcutBinding(item,index){
    const bindings=getShortcutBindings(item);
    if(SYSTEM_SHORTCUT_IDS.has(item.id)&&bindings.length<=1){
      notify('Системное действие нельзя полностью отключить');
      return;
    }
    const removed=bindings[index];settings.shortcuts[item.id]=bindings.filter((_,bindingIndex)=>bindingIndex!==index);if(settings.shortcut_options[item.id])delete settings.shortcut_options[item.id][removed];cancelPendingShortcuts(item.id);save();renderShortcutList();
  }
  function resetShortcut(item){
    delete settings.shortcuts[item.id];
    delete settings.shortcut_enabled[item.id];
    delete settings.shortcut_options[item.id];
    cancelPendingShortcuts(item.id);
    if(recordingShortcut?.id===item.id)recordingShortcut=null;
    save();renderShortcutList();
  }
  function renderShortcutList(){
    const list=$('shortcutList');if(!list)return;list.replaceChildren();
    const count=$('shortcutCount');if(count)count.textContent=`Назначено ${getTotalShortcutBindings()} из ${MAX_SHORTCUT_BINDINGS}`;
    const query=($('shortcutSearch')?.value||'').trim().toLowerCase();let category='';
    const recordingId=recordingShortcut&&recordingShortcut.id;
    for(const item of shortcutDefaults){
      const bindings=getShortcutBindings(item),enabled=isShortcutEnabled(item),system=SYSTEM_SHORTCUT_IDS.has(item.id),options=getShortcutOptions(item),searchable=`${item.title} ${item.category} ${bindings.join(' ')}`.toLowerCase();
      if(query&&!searchable.includes(query))continue;
      if(category!==item.category){category=item.category;const heading=document.createElement('div');heading.className='shortcut-group';heading.textContent=category;list.appendChild(heading)}
      const row=document.createElement('div');row.className=`shortcut-row${enabled?'':' shortcut-disabled'}`;
      const title=document.createElement('span');title.className='shortcut-description';title.textContent=SYSTEM_SHORTCUT_IDS.has(item.id)?`[SYSTEM] ${item.title}`:item.title;
      const titleCell=document.createElement('div');titleCell.className='shortcut-title-cell';titleCell.appendChild(title);
      const optionBar=document.createElement('span');optionBar.className='shortcut-options';
      const modeSelect=document.createElement('select');modeSelect.className='shortcut-option';modeSelect.setAttribute('aria-label',`Режим сочетаний для действия «${item.title}»`);
      for(const [value,label] of [['press','Нажатие'],['hold','Удержание'],['double','Двойное'],['long','Долгое']]){const option=document.createElement('option');option.value=value;option.textContent=label;modeSelect.appendChild(option)}
      modeSelect.value=options.mode;modeSelect.onchange=()=>{setShortcutOptions(item,'mode',modeSelect.value);reset.disabled=false};
      const contextSelect=document.createElement('select');contextSelect.className='shortcut-option';contextSelect.setAttribute('aria-label',`Контекст сочетаний для действия «${item.title}»`);
      for(const [value,label] of [['global','Везде'],['canvas','Холст'],['timeline','Таймлайн'],['assistant','ИИ']]){const option=document.createElement('option');option.value=value;option.textContent=label;contextSelect.appendChild(option)}
      contextSelect.value=options.context;contextSelect.onchange=()=>{setShortcutOptions(item,'context',contextSelect.value);reset.disabled=false};
      optionBar.append(modeSelect,contextSelect);titleCell.appendChild(optionBar);
      const toggle=document.createElement('button');toggle.type='button';toggle.className='shortcut-toggle';toggle.textContent=system?'SYSTEM':enabled?'Вкл':'Выкл';toggle.disabled=system;toggle.setAttribute('aria-pressed',String(enabled));toggle.setAttribute('aria-label',system?`Системное действие всегда включено: ${item.title}`:`${enabled?'Отключить':'Включить'} горячие клавиши для действия «${item.title}»`);toggle.title=system?'Системные действия всегда включены':enabled?'Отключить сочетания этого действия':'Включить сочетания этого действия';if(!system)toggle.onclick=()=>setShortcutEnabled(item,!enabled);
      const bindingList=document.createElement('span');bindingList.className='shortcut-bindings';
      if(recordingId===item.id){const prompt=document.createElement('span');prompt.className='shortcut-binding recording';prompt.textContent='Нажмите клавиши…';bindingList.appendChild(prompt)}
      else if(bindings.length){
        bindings.forEach((binding,index)=>{const chip=document.createElement('span');chip.className='shortcut-chip';const text=document.createElement('span');text.className='shortcut-binding';text.textContent=binding;const remove=document.createElement('button');remove.type='button';remove.className='shortcut-remove';remove.textContent='×';const required=SYSTEM_SHORTCUT_IDS.has(item.id)&&bindings.length<=1;remove.disabled=required;remove.title=required?'Нельзя удалить последнее системное сочетание':'Удалить сочетание';remove.setAttribute('aria-label',`${required?'Обязательное системное сочетание':'Удалить сочетание'} ${binding} для действия «${item.title}»`);remove.onclick=()=>removeShortcutBinding(item,index);chip.append(text,remove);bindingList.appendChild(chip)})
      }else{const empty=document.createElement('span');empty.className='shortcut-empty';empty.textContent='Не назначено';bindingList.appendChild(empty)}
      const actions=document.createElement('span');actions.className='shortcut-actions';
      const add=document.createElement('button');add.type='button';add.className='shortcut-record';add.textContent=recordingId===item.id&&recordingShortcut.mode==='add'?'Отмена':'＋';add.title='Добавить сочетание';add.disabled=(bindings.length>=MAX_SHORTCUTS_PER_ACTION||getTotalShortcutBindings()>=MAX_SHORTCUT_BINDINGS)&&recordingId!==item.id;add.onclick=()=>{recordingShortcut=recordingId===item.id&&recordingShortcut.mode==='add'?null:{id:item.id,mode:'add'};renderShortcutList()};
      const replace=document.createElement('button');replace.type='button';replace.className='shortcut-record';replace.textContent=recordingId===item.id&&recordingShortcut.mode==='replace'?'Отмена':'Назначить';replace.onclick=()=>{recordingShortcut=recordingId===item.id&&recordingShortcut.mode==='replace'?null:{id:item.id,mode:'replace'};renderShortcutList()};
      const reset=document.createElement('button');reset.type='button';reset.className='shortcut-record';reset.textContent='Сброс';reset.title='Сбросить действие к стандартным сочетаниям';reset.setAttribute('aria-label',`Сбросить сочетания для действия «${item.title}»`);reset.disabled=!Object.prototype.hasOwnProperty.call(settings.shortcuts,item.id)&&!Object.prototype.hasOwnProperty.call(settings.shortcut_enabled,item.id)&&!Object.prototype.hasOwnProperty.call(settings.shortcut_options,item.id);reset.onclick=()=>resetShortcut(item);
      actions.append(add,replace,reset);row.append(titleCell,toggle,bindingList,actions);list.appendChild(row);
    }
    if(!list.children.length){const empty=document.createElement('div');empty.className='palette-empty';empty.textContent='Действий не найдено';list.appendChild(empty)}
  }
  function isValidShortcutBinding(binding){
    if(typeof binding!=='string'||binding.length>40)return false;
    const parts=binding.split('+'),key=parts.pop(),modifiers=parts;
    const canonicalModifiers=['Ctrl','Alt','Shift'].filter(modifier=>modifiers.includes(modifier));
    if(modifiers.length!==canonicalModifiers.length||modifiers.some((modifier,index)=>modifier!==canonicalModifiers[index]))return false;
    const namedKeys=new Set(['Space',',','.','Backspace','Delete','Enter','Escape','Home','End','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown','Tab','Insert','-','=','[',']',';',"'",'/',"\\",'`']);
    return /^[A-Z0-9]$/.test(key)||/^F(?:[1-9]|1[0-9]|2[0-4])$/.test(key)||namedKeys.has(key);
  }
  function isReservedShortcut(binding){return /^(Ctrl\+Alt\+Delete|Alt\+Tab|Alt\+F4|Ctrl\+Shift\+Escape|Ctrl\+W|Ctrl\+U)$/i.test(binding)}
  function validateShortcutProfile(profile){
    if(!profile||profile.format!=='floxzert-shortcut-profile'||![1,2,3].includes(profile.version)||!profile.shortcuts||typeof profile.shortcuts!=='object'||Array.isArray(profile.shortcuts))throw new Error('Файл не является профилем горячих клавиш FloxZert версии 1, 2 или 3');
    const knownIds=new Set(shortcutDefaults.map(item=>item.id)),imported={};
    const enabled=Object.fromEntries(shortcutDefaults.map(item=>[item.id,true]));
    const options=Object.fromEntries(shortcutDefaults.map(item=>[item.id,{mode:'press',context:'global'}]));
    if(profile.version>=2){
      if(!profile.enabled||typeof profile.enabled!=='object'||Array.isArray(profile.enabled))throw new Error('Профиль должен содержать состояния включения горячих клавиш');
      for(const [id,value] of Object.entries(profile.enabled)){
        if(!knownIds.has(id))throw new Error(`В профиле неизвестное действие: ${id}`);
        if(typeof value!=='boolean')throw new Error(`Некорректный статус горячих клавиш для действия ${id}`);
        if(SYSTEM_SHORTCUT_IDS.has(id)&&!value)throw new Error(`Системное действие ${id} нельзя отключить`);
        enabled[id]=value;
      }
    }
    if(profile.version>=3){
      if(!profile.options||typeof profile.options!=='object'||Array.isArray(profile.options))throw new Error('Профиль версии 3 должен содержать режимы и контексты сочетаний');
      for(const [id,value] of Object.entries(profile.options)){
        if(!knownIds.has(id))throw new Error(`В профиле неизвестное действие: ${id}`);
        if(!value||typeof value!=='object'||Array.isArray(value)||!SHORTCUT_MODES.includes(value.mode)||!SHORTCUT_CONTEXTS.includes(value.context))throw new Error(`Некорректный режим или контекст действия ${id}`);
        options[id]={mode:value.mode,context:value.context};
      }
    }
    for(const [id,bindings] of Object.entries(profile.shortcuts)){
      if(!knownIds.has(id))throw new Error(`В профиле неизвестное действие: ${id}`);
      if(!Array.isArray(bindings)||bindings.length>MAX_SHORTCUTS_PER_ACTION)throw new Error(`Для действия ${id} разрешено от 0 до ${MAX_SHORTCUTS_PER_ACTION} сочетаний`);
      if(SYSTEM_SHORTCUT_IDS.has(id)&&bindings.length===0)throw new Error(`Системное действие ${id} нельзя полностью отключить`);
      if(bindings.some(binding=>!isValidShortcutBinding(binding)))throw new Error(`Некорректное сочетание клавиш для действия ${id}`);
      if(new Set(bindings).size!==bindings.length)throw new Error(`В профиле повторяется сочетание для действия ${id}`);
      if(bindings.some(isReservedShortcut))throw new Error('Профиль содержит системное сочетание, которое нельзя назначить');
      imported[id]=bindings.slice();
    }
    const totalBindings=shortcutDefaults.reduce((total,item)=>total+(Object.prototype.hasOwnProperty.call(imported,item.id)?imported[item.id]:item.keys).length,0);
    if(totalBindings>MAX_SHORTCUT_BINDINGS)throw new Error(`В профиле не может быть больше ${MAX_SHORTCUT_BINDINGS} назначений`);
    const owners=new Map();
    for(const item of shortcutDefaults){
      const bindings=Object.prototype.hasOwnProperty.call(imported,item.id)?imported[item.id]:item.keys;
      if(!enabled[item.id])continue;
      for(const binding of bindings){
        const keyOwners=owners.get(binding)||[],conflict=keyOwners.find(owner=>shortcutContextsOverlap(owner.context,options[item.id].context));
        if(conflict)throw new Error(`Сочетание ${binding} конфликтует между действиями «${conflict.title}» и «${item.title}»`);
        keyOwners.push({title:item.title,context:options[item.id].context});owners.set(binding,keyOwners);
      }
    }
    return {shortcuts:imported,enabled,options};
  }
  function exportShortcutProfile(){
    const shortcuts=Object.fromEntries(shortcutDefaults.map(item=>[item.id,getShortcutBindings(item)]));
    const enabled=Object.fromEntries(shortcutDefaults.map(item=>[item.id,isShortcutEnabled(item)]));
    const options=Object.fromEntries(shortcutDefaults.map(item=>[item.id,getShortcutOptions(item)]));
    const profile={format:'floxzert-shortcut-profile',version:3,shortcuts,enabled,options};
    const blob=new Blob([JSON.stringify(profile,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='floxzert-shortcuts.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function importShortcutProfile(file){
    const reader=new FileReader();
    reader.onerror=()=>{notify('Не удалось прочитать профиль горячих клавиш');console.error('Shortcut profile read failed',reader.error);$('shortcutProfileFile').value=''};
    reader.onload=()=>{
      try{
        const profile=JSON.parse(reader.result),validated=validateShortcutProfile(profile);
        settings.shortcuts=validated.shortcuts;settings.shortcut_enabled=validated.enabled;settings.shortcut_options=validated.options;recordingShortcut=null;clearPendingShortcutStates();save();renderShortcutList();notify('Профиль горячих клавиш импортирован');
      }catch(error){notify(error.message);console.error('Shortcut profile import failed',error)}
      finally{$('shortcutProfileFile').value=''}
    };
    reader.readAsText(file);
  }
  function normalizeShortcut(event){const code=event.code;let key=event.key;if(/^Key[A-Z]$/.test(code))key=code.slice(3);else if(code==='Space')key='Space';else if(code==='Comma')key=',';else if(code==='Period')key='.';else if(/^Digit[0-9]$/.test(code))key=code.slice(5);else if(/^Numpad[0-9]$/.test(code))key=code.slice(6);else if(key.length===1)key=key.toUpperCase();const modifiers=[];if(event.ctrlKey||event.metaKey)modifiers.push('Ctrl');if(event.altKey)modifiers.push('Alt');if(event.shiftKey)modifiers.push('Shift');if(['Control','Alt','Shift','Meta'].includes(key))return '';return [...modifiers,key].join('+')}
  function isTextEntry(target){return target instanceof HTMLElement&&(target.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))}
  function runConfiguredShortcut(item,binding,event){
    const options=getShortcutOptions(item),eventContext=getShortcutContext(event.target),context=eventContext==='global'?activeShortcutContext:eventContext;
    if(options.context!=='global'&&options.context!==context)return false;
    const pendingKey=`${item.id}\u0000${binding}`;
    if(options.mode==='double'){
      const now=performance.now(),previous=lastShortcutPresses.get(pendingKey);
      if(previous!==undefined&&now-previous<=350){lastShortcutPresses.delete(pendingKey);executeShortcut(item.id)}
      else lastShortcutPresses.set(pendingKey,now);
    }else if(options.mode==='hold'||options.mode==='long'){
      if(!pendingShortcutHolds.has(pendingKey)){
        const timer=setTimeout(()=>{pendingShortcutHolds.delete(pendingKey);executeShortcut(item.id)},options.mode==='hold'?400:900);
        pendingShortcutHolds.set(pendingKey,{timer,code:event.code});
      }
    }else executeShortcut(item.id);
    event.preventDefault();return true;
  }
  function releaseHeldShortcut(event){
    for(const [key,pending] of pendingShortcutHolds){if(pending.code===event.code){clearTimeout(pending.timer);pendingShortcutHolds.delete(key)}}
  }
  function handleShortcutKey(event){if(recordingShortcut){
      if(event.key==='Escape'){recordingShortcut=null;renderShortcutList();event.preventDefault();return true}
      const {id,mode}=recordingShortcut,key=event.key==='Backspace'?'':normalizeShortcut(event),item=shortcutDefaults.find(candidate=>candidate.id===id);
      if(!key&&event.key!=='Backspace'){event.preventDefault();return true}
      if(event.key==='Backspace'&&mode==='add'){notify('Чтобы удалить отдельное сочетание, нажмите × рядом с ним');event.preventDefault();return true}
      if(event.key==='Backspace'&&mode==='replace'&&SYSTEM_SHORTCUT_IDS.has(id)){notify('Системное действие нельзя полностью отключить');event.preventDefault();return true}
      if(key&&isReservedShortcut(key)){notify(key==='Ctrl+U'?'Ctrl+U зарезервировано браузером для просмотра исходного кода':'Эту системную комбинацию переназначить нельзя');event.preventDefault();return true}
      const targetContext=getShortcutOptions(item).context;
      const conflict=key&&shortcutDefaults.find(candidate=>candidate.id!==id&&isShortcutEnabled(candidate)&&shortcutContextsOverlap(targetContext,getShortcutOptions(candidate).context)&&getShortcutBindings(candidate).includes(key));
      if(conflict){notify(`Сочетание уже назначено: ${conflict.title}`);event.preventDefault();return true}
      if(mode==='add'&&key){
        const bindings=getShortcutBindings(item);
        if(bindings.includes(key)){notify('Это сочетание уже назначено для действия');event.preventDefault();return true}
        if(bindings.length>=MAX_SHORTCUTS_PER_ACTION){notify(`Для одного действия можно назначить не более ${MAX_SHORTCUTS_PER_ACTION} сочетаний`);event.preventDefault();return true}
        if(getTotalShortcutBindings()>=MAX_SHORTCUT_BINDINGS){notify(`Достигнут общий лимит: ${MAX_SHORTCUT_BINDINGS} назначений`);event.preventDefault();return true}
        settings.shortcuts[id]=[...bindings,key];
      }else settings.shortcuts[id]=key?[key]:[];
      recordingShortcut=null;save();renderShortcutList();event.preventDefault();return true
    }
    if(event.repeat)return false;
    const paletteOpen=!$('paletteModal').classList.contains('hidden'),managerOpen=!$('managerModal').classList.contains('hidden'),settingsOpen=!$('settingsModal').classList.contains('hidden');
    if(event.key==='Escape'){if(paletteOpen)$('paletteModal').classList.add('hidden');else if(managerOpen)$('managerModal').classList.add('hidden');else if(settingsOpen)$('settingsModal').classList.add('hidden');else $('assistantPanel').classList.add('hidden');return true}
    if(paletteOpen){if(event.key==='ArrowDown'||event.key==='ArrowUp'){movePaletteSelection(event.key==='ArrowDown'?1:-1);event.preventDefault();return true}if(event.key==='Enter'){activatePaletteSelection();event.preventDefault();return true}}
    if(isTextEntry(event.target))return false;
    if(managerOpen||settingsOpen)return false;
    const shortcut=normalizeShortcut(event);if(!shortcut)return false;
    for(const item of shortcutDefaults){if(getActiveShortcutBindings(item).includes(shortcut)&&runConfiguredShortcut(item,shortcut,event))return true}
    return false}
  function openCommandPalette(){paletteIndex=0;$('paletteModal').classList.remove('hidden');$('paletteSearch').value='';renderCommandPalette();$('paletteSearch').focus()}
  function renderCommandPalette(){const results=$('paletteResults');results.replaceChildren();const commands=shortcutDefaults.filter(item=>{const query=$('paletteSearch').value.toLowerCase();return !query||`${item.title} ${item.category}`.toLowerCase().includes(query)});if(!commands.length){const empty=document.createElement('div');empty.className='palette-empty';empty.textContent='Команды не найдены';results.appendChild(empty);return}paletteIndex=Math.max(0,Math.min(paletteIndex,commands.length-1));commands.forEach((item,index)=>{const button=document.createElement('button');button.type='button';button.className='palette-command'+(index===paletteIndex?' active':'');button.textContent=item.title;const categoryLabel=document.createElement('small');categoryLabel.textContent=item.category;button.appendChild(categoryLabel);button.onclick=()=>{ $('paletteModal').classList.add('hidden');executeShortcut(item.id)};results.appendChild(button)})}
  function movePaletteSelection(delta){const count=$('paletteResults').querySelectorAll('.palette-command').length;if(!count)return;paletteIndex=(paletteIndex+delta+count)%count;renderCommandPalette()}
  function activatePaletteSelection(){const button=$('paletteResults').querySelectorAll('.palette-command')[paletteIndex];button?.click()}
  function showShortcutHelp(){showManager('Рабочие сочетания клавиш');const body=$('managerBody');const text=document.createElement('p');text.className='manager-confirm';text.textContent='Сохранение: Ctrl+S · Отмена: Ctrl+Z · Повтор: Ctrl+Shift+Z или Ctrl+Y · Кисть: B · Фигуры: R, O, L · Кадр: F5 · Воспроизведение: Space. Все сочетания можно найти и переназначить в Настройки → Горячие клавиши.';const button=document.createElement('button');button.type='button';button.className='wide-button';button.textContent='Открыть раскладку';button.onclick=()=>{$('managerModal').classList.add('hidden');$('settingsButton').click();document.querySelector('[data-settings-tab="shortcuts"]').click()};body.append(text,button)}
  function openTextEditor(position){showManager('Добавить текст');const form=document.createElement('form');form.className='manager-form';const input=document.createElement('input');input.name='text';input.maxLength=100000;input.required=true;input.placeholder='Введите текст';const submit=document.createElement('button');submit.type='submit';submit.textContent='Добавить';form.append(input,submit);form.onsubmit=event=>{event.preventDefault();snapshot();const object={id:crypto.randomUUID(),type:'text',x:position.x,y:position.y,text:input.value,stroke:strokeColor.value,fill:fillColor.value,fillEnabled:$('fillEnabled').checked,fillGradient:$('fillEnabled').checked&&settings.fill_gradient_enabled?gradientForObject():undefined,width:Number($('strokeWidth').value),textSize:Number($('brushSize').value)*4,opacity:Number($('opacity').value),shadowEnabled:settings.shadow_enabled===true,shadowColor:settings.shadow_color,layer:activeLayer,frame:currentFrame};objects.push(object);selectedIds=new Set([object.id]);selectedId=object.id;$('managerModal').classList.add('hidden');finishChange()};$('managerBody').appendChild(form);input.focus()}
  $('undoButton').onclick=()=>{if(!history.length)return;redoStack.push(JSON.stringify({objects,frameStates,frameCount,currentFrame,layers,settings}));const s=JSON.parse(history.pop());objects=s.objects;frameStates=s.frameStates;frameCount=s.frameCount;currentFrame=s.currentFrame;layers=s.layers||layers;settings=s.settings||settings;syncTimelineControls();finishChange()};
  $('redoButton').onclick=()=>{if(!redoStack.length)return;history.push(JSON.stringify({objects,frameStates,frameCount,currentFrame,layers,settings}));const s=JSON.parse(redoStack.pop());objects=s.objects;frameStates=s.frameStates;frameCount=s.frameCount;currentFrame=s.currentFrame;layers=s.layers||layers;settings=s.settings||settings;syncTimelineControls();finishChange()};
  $('opacity').oninput=e=>{$('opacityValue').textContent=e.target.value+'%'};
  let objectOpacityEditing=false,objectOpacityChanged=false;
  const beginObjectOpacityEdit=()=>{if(!objectOpacityEditing&&currentSelection().some(object=>!object.locked&&!layers.find(layer=>layer.id===object.layer)?.locked)){snapshot();objectOpacityEditing=true;objectOpacityChanged=false}};
  $('objectOpacity').onkeydown=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(e.key))beginObjectOpacityEdit()};
  $('objectOpacity').oninput=e=>{
    $('objectOpacityValue').textContent=e.target.value+'%';
    const selection=currentSelection().filter(object=>!object.locked&&!layers.find(layer=>layer.id===object.layer)?.locked);
    if(selection.length){beginObjectOpacityEdit();selection.forEach(object=>object.opacity=Number(e.target.value));objectOpacityChanged=true;render();markLearningComplete('Изменить прозрачность')}
  };
  $('objectOpacity').onchange=()=>{if(!objectOpacityEditing)return;if(objectOpacityChanged)finishChange();else history.pop();objectOpacityEditing=false;objectOpacityChanged=false};
  $('brushSize').onchange=e=>{settings.brush_size=Math.max(1,Math.min(80,Number(e.target.value)||8));e.target.value=settings.brush_size;save()};
  $('blurRadius').onchange=e=>{settings.blur_radius=Math.max(1,Math.min(80,Number(e.target.value)||8));e.target.value=settings.blur_radius;save()};
  let layerOpacityEditing=false;
  $('layerOpacity').onpointerdown=()=>{if(!layerOpacityEditing){snapshot();layerOpacityEditing=true}};
  $('layerOpacity').onkeydown=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(e.key)&&!layerOpacityEditing){snapshot();layerOpacityEditing=true}};
  $('layerOpacity').onchange=()=>{layerOpacityEditing=false};
  $('layerOpacity').oninput=e=>{const layer=layers.find(item=>item.id===activeLayer);if(!layer)return;layer.opacity=Number(e.target.value);layerOpacityById.set(layer.id,layer.opacity);$('layerOpacityValue').textContent=`${e.target.value}%`;render();save()};
  $('fillEnabled').onchange=e=>{setSelectionFillEnabled(e.target.checked);markLearningComplete('Изменить заливку')};
  $('panelFill').onchange=e=>setSelectionFillEnabled(e.target.checked);
  let colorEditChanged=false,colorEditControl=null;
  function finishColorEdit(){
    if(!colorEditControl)return;
    if(colorEditChanged)finishChange();else history.pop();
    colorEditChanged=false;colorEditControl=null
  }
  [['fillColor','fill','fill_color'],['strokeColor','stroke','stroke_color'],['shadowColor','shadowColor','shadow_color']].forEach(([control,key,settingKey])=>{
    $(control).onfocus=()=>{if(!colorEditControl){snapshot();colorEditControl=control;colorEditChanged=false}};
    $(control).oninput=()=>{
      colorEditChanged=true;
      settings[settingKey]=$(control).value;
      editableSelection(selectionContents(currentSelection())).forEach(object=>{object[key]=$(control).value});
      render()
    };
    $(control).onchange=finishColorEdit;$(control).onblur=finishColorEdit
  });
  $('shadowEnabled').onchange=event=>{
    snapshot();settings.shadow_enabled=event.target.checked;
    editableSelection(selectionContents(currentSelection())).forEach(object=>{object.shadowEnabled=event.target.checked;object.shadowColor=$('shadowColor').value});
    finishChange()
  };
  let strokeWidthEditing=false,strokeWidthChanged=false,cornerRadiusEditing=false;
  const beginStrokeWidthEdit=()=>{if(editableSelection(selectionContents()).length&&!strokeWidthEditing){snapshot();strokeWidthEditing=true;strokeWidthChanged=false}};
  const applyStrokeWidth=value=>{
    const selection=editableSelection(selectionContents()),width=Math.max(0,Math.min(80,Number(value)||0));
    if(!selection.length||!Number.isFinite(Number(value)))return;
    beginStrokeWidthEdit();
    selection.forEach(object=>{object.width=width;if(width>0)object.strokeEnabled=true});
    strokeWidthChanged=true;render()
  };
  const finishStrokeWidthEdit=()=>{
    if(!strokeWidthEditing)return;
    if(strokeWidthChanged)finishChange();else history.pop();
    strokeWidthEditing=false;strokeWidthChanged=false
  };
  ['strokeWidth','strokeWidthContext'].forEach(id=>{
    const control=$(id);
    control.onfocus=beginStrokeWidthEdit;
    control.oninput=e=>{if(e.target.value!=='')applyStrokeWidth(e.target.value)};
    control.onchange=finishStrokeWidthEdit;
    control.onblur=finishStrokeWidthEdit
  });
  $('cornerRadius').onfocus=()=>{cornerRadiusEditing=false};
  $('cornerRadius').oninput=e=>{
    const selection=selectionContents().filter(object=>['rect','roundrect'].includes(object.type)&&!layers.find(layer=>layer.id===object.layer)?.locked);
    if(!selection.length)return;
    if(!cornerRadiusEditing){snapshot();cornerRadiusEditing=true}
    const radius=Math.max(0,Math.min(300,Number(e.target.value)||0));selection.forEach(object=>object.cornerRadius=radius);render()
  };
  $('cornerRadius').onchange=()=>{if(cornerRadiusEditing){cornerRadiusEditing=false;finishChange()}};
  $('strokeStyle').onchange=e=>{const selection=editableSelection(selectionContents());if(!selection.length)return;snapshot();selection.forEach(object=>object.dash=e.target.value);finishChange()};
  $('removeFill').onclick=removeSelectionFill;
  $('removeStroke').onclick=removeSelectionStroke;
  $('gradientEnabled').onchange=e=>{settings.fill_gradient_enabled=e.target.checked;save()};
  $('gradientType').onchange=e=>{settings.fill_gradient_type=e.target.value;save();render()};
  $('gradientAngle').onchange=e=>{settings.fill_gradient_angle=Math.max(-360,Math.min(360,Number(e.target.value)||0));e.target.value=settings.fill_gradient_angle;save();render()};
  $('addGradientStop').onclick=()=>{
    const stops=settings.fill_gradient_stops.slice().sort((a,b)=>a.offset-b.offset);
    if(stops.length>=16){notify('В градиенте может быть не более 16 стопов');return}
    let gapStart=stops[0],gapEnd=stops[1];
    for(let i=1;i<stops.length-1;i++)if(stops[i+1].offset-stops[i].offset>gapEnd.offset-gapStart.offset){gapStart=stops[i];gapEnd=stops[i+1]}
    settings.fill_gradient_stops.push({offset:(gapStart.offset+gapEnd.offset)/2,color:gapStart.color});
    settings.fill_gradient_stops.sort((a,b)=>a.offset-b.offset);renderGradientStops();save();render()
  };
  $('applyGradient').onclick=()=>{
    const selection=currentSelection().filter(object=>!layers.find(layer=>layer.id===object.layer)?.locked);
    if(!selection.length){notify('Выберите фигуры на разблокированном слое');return}
    snapshot();selection.forEach(object=>{object.fillEnabled=true;object.fillGradient=gradientForObject()});$('fillEnabled').checked=true;$('panelFill').checked=true;finishChange()
  };
  $('removeGradient').onclick=()=>{
    const selection=currentSelection().filter(object=>!layers.find(layer=>layer.id===object.layer)?.locked);
    if(!selection.length){notify('Выберите фигуры на разблокированном слое');return}
    snapshot();selection.forEach(object=>delete object.fillGradient);settings.fill_gradient_enabled=false;$('gradientEnabled').checked=false;finishChange()
  };
  document.querySelectorAll('[data-boolean]').forEach(b=>b.onclick=()=>notify('Булевы операции требуют векторного геометрического ядра и пока недоступны'));
  $('addLayer').onclick=$('layerAddPanel').onclick=()=>{const l={id:'layer-'+Date.now(),name:`Слой ${layers.length+1}`,visible:true,locked:false,opacity:100};const backgroundIndex=layers.findIndex(layer=>layer.id==='layer-3'||/фон/i.test(layer.name));snapshot();layers.splice(backgroundIndex<0?layers.length:backgroundIndex,0,l);activeLayer=l.id;renderLayers();renderTimeline();render();save()};
  $('createMotionTween').onclick=()=>{
    const selection=currentSelection();
    if(!selection.length){notify('Выберите один или несколько объектов для motion tween');return}
    const sources=selection.filter(source=>!source.generatedTween&&source.frame===currentFrame&&!layers.find(layer=>layer.id===source.layer)?.locked);
    if(!sources.length){notify('Выберите разблокированные объекты текущего кадра');return}
    if(sources.length!==selection.length){notify('Пропущены промежуточные или заблокированные объекты')}
    if(sources.some(source=>objects.some(o=>o.trackId===source.trackId&&source.trackId&&o.frame>currentFrame))){notify('У одного из объектов уже есть следующий ключевой кадр');return}
    const duration=Math.max(2,Math.min(500,Number($('tweenDuration').value)||settings.motion_tween_duration||12));
    settings.motion_tween_duration=duration;$('tweenDuration').value=duration;
    const targetFrame=currentFrame+duration;
    if(targetFrame>5000){notify('Достигнут предел таймлайна (5000 кадров)');return}
    snapshot();
    const endpoints=[];
    sources.forEach(source=>{
      const trackId=source.trackId||crypto.randomUUID();
      source.trackId=trackId;
      source.easing=settings.tween_easing||'linear';
      const endpoint=cloneObjectToFrame(source,targetFrame);
      endpoint.trackId=trackId;
      objects.push(endpoint);endpoints.push(endpoint);
    });
    frameCount=Math.max(frameCount,targetFrame);
    currentFrame=targetFrame;
    settings.loop_end=Math.max(settings.loop_end,targetFrame);
    syncTimelineControls();
    selectedIds=new Set(endpoints.map(endpoint=>endpoint.id));selectedId=endpoints[0]?.id||null;
    finishChange();
    notify(`Создан tween на ${duration} кадров. Переместите/поверните конечную позу у выделенных объектов.`);
  };
  $('tweenDuration').onchange=e=>{
    settings.motion_tween_duration=Math.max(2,Math.min(500,Number(e.target.value)||12));
    e.target.value=settings.motion_tween_duration;save();
  };
  function setBlankKeyframe(layerId,frame,isBlank){
    const frames=settings.blank_keyframes[layerId]||[];
    settings.blank_keyframes[layerId]=isBlank?[...new Set([...frames,frame])].sort((a,b)=>a-b):frames.filter(item=>item!==frame);
    if(!settings.blank_keyframes[layerId].length)delete settings.blank_keyframes[layerId];
  }
  function copyBlankKeyframes(sourceFrame,targetFrame){
    for(const layer of layers){
      const sourceIsBlank=settings.blank_keyframes[layer.id]?.includes(sourceFrame);
      setBlankKeyframe(layer.id,targetFrame,Boolean(sourceIsBlank))
    }
  }
  $('addLayerKeyframe').onclick=()=>{
    const layer=layers.find(item=>item.id===activeLayer);
    if(!layer||layer.locked){notify('Разблокируйте активный слой, чтобы добавить ключевой кадр');return}
    if(objects.some(object=>object.layer===activeLayer&&object.frame===currentFrame)){notify('В активном слое уже есть ключевой кадр');return}
    let sourceFrame=currentFrame,base=currentObjects(currentFrame).filter(object=>object.layer===activeLayer);
    if(!base.length){
      for(let frame=currentFrame-1;frame>=1;frame--){
        if(settings.blank_keyframes[activeLayer]?.includes(frame))break;
        base=currentObjects(frame).filter(object=>object.layer===activeLayer);
        if(base.length){sourceFrame=frame;break}
      }
    }
    if(!base.length){notify('Нет содержимого для создания ключевого кадра');return}
    snapshot();setBlankKeyframe(activeLayer,currentFrame,false);
    const copies=base.map(object=>cloneObjectToFrame(object,currentFrame));
    objects.push(...copies);selectedIds=new Set(copies.map(object=>object.id));selectedId=copies[0]?.id||null;
    finishChange();notify(`Содержимое кадра ${sourceFrame} сохранено в ключевом кадре ${currentFrame}`)
  };
  $('addBlankKeyframe').onclick=()=>{
    const layer=layers.find(item=>item.id===activeLayer);
    if(!layer||layer.locked){notify('Разблокируйте активный слой, чтобы добавить пустой ключевой кадр');return}
    snapshot();objects=objects.filter(object=>object.layer!==activeLayer||object.frame!==currentFrame);
    setBlankKeyframe(activeLayer,currentFrame,true);selectedIds.clear();selectedId=null;finishChange()
  };
  $('clearLayerFrame').onclick=()=>{
    const layer=layers.find(item=>item.id===activeLayer);
    if(!layer||layer.locked){notify('Разблокируйте активный слой, чтобы очистить кадр');return}
    snapshot();objects=objects.filter(object=>object.layer!==activeLayer||object.frame!==currentFrame);
    setBlankKeyframe(activeLayer,currentFrame,false);selectedIds.clear();selectedId=null;finishChange()
  };
  $('addFrame').onclick=()=>{if(frameCount>=5000){notify('Достигнут предел таймлайна (5000 кадров)');return}snapshot();const sourceFrame=currentFrame,targetFrame=frameCount+1,prev=frameStates[sourceFrame]||objects.filter(o=>o.frame===sourceFrame);frameCount=targetFrame;currentFrame=targetFrame;objects=objects.filter(o=>o.frame!==targetFrame).concat(prev.map(object=>cloneObjectToFrame(object,targetFrame)));copyBlankKeyframes(sourceFrame,targetFrame);finishChange()};
  $('copyFrame').onclick=()=>{const next=currentFrame+1;if(next>5000){notify('Достигнут предел таймлайна (5000 кадров)');return}snapshot();frameCount=Math.max(frameCount,next);const sourceFrame=currentFrame,base=objects.filter(o=>o.frame===sourceFrame);objects=objects.filter(o=>o.frame!==next).concat(base.map(object=>cloneObjectToFrame(object,next)));copyBlankKeyframes(sourceFrame,next);currentFrame=next;markLearningComplete('Скопировать кадр');finishChange()};
  $('nextFrame').onclick=()=>{currentFrame=Math.min(frameCount,currentFrame+1);updateTimeline();render()};$('prevFrame').onclick=()=>{currentFrame=Math.max(1,currentFrame-1);updateTimeline();render()};$('firstFrame').onclick=()=>{currentFrame=1;updateTimeline();render()};$('lastFrame').onclick=()=>{currentFrame=frameCount;updateTimeline();render()};
  $('playButton').onclick=()=>{
    playing=!playing;
    $('playButton').textContent=playing?'Ⅱ':'▶';
    if(playing){if(settings.loop_enabled&&(currentFrame<settings.loop_start||currentFrame>settings.loop_end))currentFrame=settings.loop_start;playTick()}
  };
  function playTick(){
    if(!playing)return;
    const end=settings.loop_enabled?settings.loop_end:frameCount;
    if(currentFrame>=end){
      if(settings.loop_enabled)currentFrame=settings.loop_start;
      else{playing=false;$('playButton').textContent='▶';return}
    }else currentFrame++;
    updateTimeline();render();
    setTimeout(playTick,1000/(Number(settings.timeline_fps||12)*Number(settings.playback_speed||1)));
  }
  $('onionButton').onclick=()=>{$('onionMode').value=settings.onion_mode==='off'?'normal':'off';$('onionMode').dispatchEvent(new Event('change'))};
  $('timelineFps').onchange=e=>{settings.timeline_fps=Math.max(1,Math.min(60,Number(e.target.value)||12));e.target.value=settings.timeline_fps;save()};
  $('onionMode').onchange=e=>{settings.onion_mode=e.target.value;onion=e.target.value!=='off';$('onionButton').classList.toggle('enabled',onion);save();render()};
  $('onionFrames').onchange=e=>{settings.onion_frames=Math.max(1,Math.min(12,Number(e.target.value)||2));e.target.value=settings.onion_frames;save();render()};
  $('loopEnabled').onchange=e=>{settings.loop_enabled=e.target.checked;save()};
  $('loopStart').onchange=e=>{settings.loop_start=Math.max(1,Math.min(frameCount,Number(e.target.value)||1));if(settings.loop_end<settings.loop_start)settings.loop_end=settings.loop_start;syncTimelineControls();save()};
  $('loopEnd').onchange=e=>{settings.loop_end=Math.max(settings.loop_start,Math.min(frameCount,Number(e.target.value)||frameCount));syncTimelineControls();save()};
  $('playbackSpeed').onchange=e=>{settings.playback_speed=Number(e.target.value);save()};
  $('tweenEasing').onchange=e=>{settings.tween_easing=e.target.value;const selected=objects.find(o=>o.id===selectedId);if(selected?.trackId)selected.easing=e.target.value;clearRenderCaches();save();render()};
  $('addFrameMarker').onclick=()=>{
    const label=prompt(`Название маркера для кадра ${currentFrame}:`,settings.frame_markers[currentFrame]||'');
    if(label===null)return;
    if(!label.trim())delete settings.frame_markers[currentFrame];
    else settings.frame_markers[currentFrame]=label.trim().slice(0,80);
    save();renderTimeline();
  };
  function changeZoom(direction){zoom=Math.max(.1,Math.min(8,Math.round((zoom+direction*.25)*100)/100));$('canvasWrap').style.transformOrigin='center';applyZoom()}
  $('zoomIn').onclick=()=>changeZoom(1);$('zoomOut').onclick=()=>changeZoom(-1);
  $('zoomValue').onclick=()=>{zoom=1;panOffset={x:0,y:0};$('canvasWrap').style.transformOrigin='center';applyZoom()};
  $('fitCanvas').onclick=()=>{zoom=1;panOffset={x:0,y:0};$('canvasWrap').style.transformOrigin='center';applyZoom()};
  function rotateSelection(degrees){
    const selection=currentSelection().filter(object=>!object.locked&&!layers.find(layer=>layer.id===object.layer)?.locked);
    if(!selection.length){notify('Сначала выделите объект, затем используйте стрелки поворота');return}
    snapshot();selection.forEach(object=>{object.rotation=((Number(object.rotation)||0)+degrees+360)%360});finishChange()
  }
  $('rotateLeft').onclick=()=>rotateSelection(-15);$('rotateRight').onclick=()=>rotateSelection(15);
  $('canvasStage').addEventListener('wheel',event=>{
    if(!event.ctrlKey&&!event.metaKey)return;
    event.preventDefault();
    const wrap=$('canvasWrap'),bounds=wrap.getBoundingClientRect();
    const originX=Math.max(0,Math.min(100,(event.clientX-bounds.left)/bounds.width*100));
    const originY=Math.max(0,Math.min(100,(event.clientY-bounds.top)/bounds.height*100));
    wrap.style.transformOrigin=`${originX}% ${originY}%`;
    zoom=Math.max(.1,Math.min(8,zoom+(event.deltaY<0?.25:-.25)));applyZoom()
  },{passive:false});
  $('gridToggle').onclick=()=>{settings.grid_enabled=!settings.grid_enabled;$('gridToggle').classList.toggle('active',settings.grid_enabled);$('gridToggle').setAttribute('aria-pressed',String(settings.grid_enabled));render();save()};
  $('gridSnap').onchange=e=>{settings.grid_snap_enabled=e.target.checked;save();notify(settings.grid_snap_enabled?'Привязка к пересечениям сетки включена':'Привязка выключена')};
  $('gridSize').onchange=e=>{settings.grid_size=Number(e.target.value);render();save()};
  $('previewQuality').onchange=e=>{settings.preview_quality=e.target.value;applyPreviewQuality();render();save()};
  $('frameQuality').onchange=e=>{settings.frame_quality_scale=Number(e.target.value);syncFrameQualityLabel();save()};
  function syncFrameQualityLabel(){
    const scale=[1,2,3,4].includes(Number(settings.frame_quality_scale))?Number(settings.frame_quality_scale):1;
    $('frameQuality').value=String(scale);$('frameQualityValue').textContent=`${canvas.width*scale} × ${canvas.height*scale} px`
  }
  $('rotateLeft').title='Повернуть выделенные объекты влево на 15°';$('rotateRight').title='Повернуть выделенные объекты вправо на 15°';
  $('backgroundColor').onchange=e=>{snapshot();settings.background_color=e.target.value;render();save()};
  function notify(msg){const hint=$('canvasHint');hint.textContent=msg;hint.style.opacity=1;setTimeout(()=>{if(objects.length)hint.style.opacity=0;else hint.innerHTML='Выберите инструмент и начните творить <kbd>?</kbd>'},1800)}
  function exportPNG(){
    const scale=[1,2,3,4].includes(Number(settings.frame_quality_scale))?Number(settings.frame_quality_scale):1;
    const output=document.createElement('canvas');output.width=canvas.width*scale;output.height=canvas.height*scale;
    const outputContext=output.getContext('2d');outputContext.fillStyle=settings.background_color||'#fbfaf7';outputContext.fillRect(0,0,output.width,output.height);
    outputContext.scale(scale,scale);currentObjects().forEach(object=>drawShape(outputContext,object));
    const a=document.createElement('a');a.download='floxzert-scene.png';a.href=output.toDataURL('image/png');a.click()
  }
  $('exportTop').onclick=exportPNG;
  $('downloadProject').onclick=async()=>{
    if(!window.floxDesktop?.saveProject){notify('Сохранение .flosk доступно только в установленном приложении для ПК');return}
    const data=projectData(),content=JSON.stringify({format:'FLOSK',format_version:1,project:data},null,2)+'\n';
    try{
      const result=await window.floxDesktop.saveProject({name:data.name,content});
      if(!result.canceled)notify(`Проект сохранён: ${result.filePath}`)
    }catch(error){notify(`Не удалось сохранить .flosk: ${error.message}`);console.error('Desktop project save failed',error)}
  };
  $('importImageButton').onclick=()=>$('imageImport').click();
  async function importProjectContent(content){
    try{
      let parsed;try{parsed=JSON.parse(content)}catch(error){throw new Error('Файл не содержит корректный JSON')}
      const data=normalizeProjectFile(parsed);
      if(apiReady){
        await flushSave();
        const response=await fetch('/api/projects/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data})}),project=await response.json();
        if(!response.ok)throw new Error(project.error||`HTTP ${response.status}`);
        currentProjectId=project.id;projectRevision=project.revision;projectDirty=false;saveBlocked=false;applyProjectData(project.data);localStorage.setItem('floxzert-project-id',currentProjectId);
      }else{
        snapshot();applyProjectData(data);projectDirty=true;
      }
      localStorage.setItem('floxzert-project',JSON.stringify(projectData()));history=[];redoStack=[];
      updateSaveStatus('Проект импортирован');renderLayers();renderTimeline();render();notify('Проект импортирован');
    }catch(error){notify(error.message);console.error('Project import failed',error)}
  }
  window.floxDesktop?.onOpenProject(project=>{
    if(!project||typeof project.content!=='string'){notify('Приложение получило пустой файл проекта');return}
    void importProjectContent(project.content)
  });
  $('imageImport').onchange=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader(),isProject=/\.(flosk|flox|json)$/i.test(file.name)||file.type==='application/json';
    reader.onerror=()=>notify('Не удалось прочитать файл');
    if(isProject){
      reader.onload=()=>void importProjectContent(reader.result);
      reader.readAsText(file);e.target.value='';return;
    }
    reader.onload=()=>{const image=new Image();image.onerror=()=>notify('Не удалось открыть изображение');image.onload=()=>{snapshot();const scale=Math.min(1,canvas.width/image.width,canvas.height/image.height);const w=image.width*scale,h=image.height*scale;const src=reader.result;imageCache.set(src,image);const item={id:crypto.randomUUID(),type:'image',src,x:(canvas.width-w)/2,y:(canvas.height-h)/2,x2:(canvas.width+w)/2,y2:(canvas.height+h)/2,opacity:100,layer:activeLayer,frame:currentFrame};objects.push(item);selectedIds=new Set([item.id]);selectedId=item.id;finishChange()};image.src=reader.result};reader.readAsDataURL(file);e.target.value='';
  };
  $('settingsButton').onclick=()=>$('settingsModal').classList.remove('hidden');$('closeSettings').onclick=$('doneSettings').onclick=()=>$('settingsModal').classList.add('hidden');
  function supportDiagnostic(){
    const profile=JSON.parse(localStorage.getItem('floxzert-account')||'null');
    return {
      app:'FloxZert Studio', version:'0.1.0', userAgent:navigator.userAgent,
      platform:navigator.platform, language:navigator.language,
      online:navigator.onLine, apiReady, currentProjectId,
      canvas:{width:canvas.width,height:canvas.height}, frameCount,
      objectCount:objects.length, layerCount:layers.length,
      profile:{language:profile?.language||null,plan:profile?.plan||'guest',consent:Boolean(profile?.consent)}
    };
  }
  function renderSupportDiagnostic(){
    if($('supportDiagnostic'))$('supportDiagnostic').textContent=JSON.stringify(supportDiagnostic(),null,2);
  }
  function openSupport(tab='faq'){
    $('supportModal').classList.remove('hidden');
    document.querySelectorAll('[data-support-tab]').forEach(button=>button.classList.toggle('selected',button.dataset.supportTab===tab));
    document.querySelectorAll('[data-support-view]').forEach(view=>view.classList.toggle('hidden',view.dataset.supportView!==tab));
    renderSupportDiagnostic();
    if(tab==='tickets')renderSupportTickets();
  }
  $('openSupport').onclick=()=>openSupport();
  $('closeSupport').onclick=()=>$('supportModal').classList.add('hidden');
  $('supportModal').addEventListener('pointerdown',event=>{if(event.target===$('supportModal'))$('supportModal').classList.add('hidden')});
  document.querySelectorAll('[data-support-tab]').forEach(button=>button.onclick=()=>openSupport(button.dataset.supportTab));
  $('copySupportDiagnostic').onclick=async()=>{
    try{await navigator.clipboard.writeText(JSON.stringify(supportDiagnostic(),null,2));notify('Диагностика скопирована')}catch(error){notify('Не удалось получить доступ к буферу обмена')}
  };
  $('supportForm').onsubmit=async event=>{
    event.preventDefault();
    if(!apiReady){$('supportTicketResult').textContent='Отправка обращений не подключена к этому сайту. Напишите на pycode.support@gmail.com';$('supportTicketResult').className='support-ticket-result error';return}
    const submit=event.submitter||$('supportForm').querySelector('[type="submit"]');
    submit.disabled=true;
    const payload={
      name:$('supportName').value.trim(),
      category:$('supportCategory').value,subject:$('supportSubject').value.trim(),
      message:$('supportMessage').value.trim(),
      diagnostic:$('supportIncludeDiagnostic').checked?supportDiagnostic():{}
    };
    try{
      const response=await fetch('/api/support/tickets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
      const ticketId=result.ticket.id.slice(0,8),recipient='pycode.support@gmail.com';
      const mailSubject=encodeURIComponent(payload.subject),mailBody=encodeURIComponent(`Имя: ${payload.name||'Пользователь FloxZert'}\nКатегория: ${payload.category}\nОбращение: ${ticketId}\n\n${payload.message}`);
      const mailLink=document.createElement('a');mailLink.href=`mailto:${recipient}?subject=${mailSubject}&body=${mailBody}`;mailLink.textContent=`Подготовить письмо на ${recipient}`;
      $('supportTicketResult').replaceChildren(document.createTextNode(`Обращение ${ticketId} сохранено в приложении. `),mailLink);
      $('supportTicketResult').className='support-ticket-result success';
      $('supportForm').reset();$('supportIncludeDiagnostic').checked=true;renderSupportTickets();
    }catch(error){$('supportTicketResult').textContent=`Не удалось создать обращение: ${error.message}`;$('supportTicketResult').className='support-ticket-result error'}
    finally{submit.disabled=false}
  };
  async function renderSupportTickets(){
    if(!apiReady){$('supportTicketList').textContent='Просмотр обращений требует отдельно размещённого API';return}
    try{
      const response=await fetch('/api/support/tickets');const result=await response.json();
      if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
      if(!result.tickets.length){$('supportTicketList').textContent='Обращений пока нет';return}
      $('supportTicketList').replaceChildren();
      result.tickets.forEach(ticket=>{
        const row=document.createElement('article');row.className='support-ticket';
        const title=document.createElement('b');title.textContent=ticket.subject;
        const meta=document.createElement('small');meta.textContent=`${ticket.category} · ${ticket.status} · ${ticket.created_at}`;
        row.append(title,meta);$('supportTicketList').appendChild(row);
      });
    }catch(error){$('supportTicketList').textContent=`Не удалось загрузить обращения: ${error.message}`}
  }
  $('refreshSupportTickets').onclick=renderSupportTickets;
  function openSocial(tab='projects'){
    $('socialModal').classList.remove('hidden');
    document.querySelectorAll('[data-social-tab]').forEach(button=>button.classList.toggle('selected',button.dataset.socialTab===tab));
    document.querySelectorAll('[data-social-view]').forEach(view=>view.classList.toggle('hidden',view.dataset.socialView!==tab));
    if(tab==='projects')renderSocialProjects();
    if(tab==='friends')renderFriends();
    if(tab==='toolbox')renderSharedToolbox();
  }
  function socialCard(title,detail,actionLabel,onAction){
    const card=document.createElement('article');card.className='social-card';
    const copy=document.createElement('div');copy.className='social-card-copy';
    const name=document.createElement('b');name.textContent=title;
    const meta=document.createElement('small');meta.textContent=detail;copy.append(name,meta);
    card.append(copy);
    if(actionLabel&&onAction){const button=document.createElement('button');button.type='button';button.textContent=actionLabel;button.onclick=onAction;card.append(button)}
    return card;
  }
  async function ensureMultiplayerIdentity(){
    if(multiplayerUserId)return multiplayerUserId;
    const profile=JSON.parse(localStorage.getItem('floxzert-account')||'null');
    if(!profile?.email){notify('Сначала сохраните email в локальном профиле');return null}
    try{
      const response=await fetch('/api/multiplayer/identity',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:profile.email,name:profile.name||'',plan:profile.plan||'free'})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
      multiplayerUserId=result.user.id;return multiplayerUserId;
    }catch(error){notify(error.message);return null}
  }
  async function renderSocialProjects(){
    const list=$('socialProjectList');if(!apiReady){list.textContent='Командные проекты требуют настроенного облачного API';return}
    const userId=await ensureMultiplayerIdentity();if(!userId)return;
    try{
      const response=await fetch('/api/multiplayer/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:userId})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
      list.replaceChildren();
      if(!result.projects.length){list.textContent='Проектов пока нет';return}
      result.projects.forEach(project=>{
        const card=socialCard(project.name,`${project.role} · ревизия ${project.revision} · ${project.updated_at}`,'Открыть',async()=>{
          try{await loadProject(project.id);$('socialModal').classList.add('hidden')}catch(error){notify(error.message)}
        });
        if(project.role==='owner'){
          const share=document.createElement('button');share.type='button';share.textContent='Поделиться';
          share.onclick=async()=>{
            const email=prompt('Email участника проекта:','');if(!email||!email.trim())return;
            const role=confirm('Разрешить редактирование? Нажмите Cancel для режима только чтения.')?'editor':'viewer';
            try{
              const response=await fetch('/api/multiplayer/projects/share',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({project_id:project.id,owner_id:userId,email:email.trim(),role})});
              const result=await response.json();if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
              notify(`Проект открыт для ${result.member.name}: ${role}`);
            }catch(error){notify(error.message)}
          };
          card.append(share);
        }
        list.append(card);
      });
    }catch(error){list.textContent=`Не удалось загрузить проекты: ${error.message}`}
  }
  async function renderFriends(){
    const list=$('friendList');const userId=await ensureMultiplayerIdentity();if(!userId)return;
    try{
      const response=await fetch('/api/multiplayer/friends',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:userId})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
      list.replaceChildren();
      if(!result.friends.length){list.textContent='Друзей пока нет';return}
      result.friends.forEach(friend=>{
        const incoming=friend.requester_id===friend.requester_id&&friend.status==='pending';
        const isIncoming=incoming&&friend.addressee_id===userId;
        const action=isIncoming? (async()=>{}) : null;
        let card;
        if(isIncoming){
          card=socialCard(friend.name,`${friend.email} · запрос в друзья`,'Принять',async()=>{
            await fetch('/api/multiplayer/friends/respond',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:userId,requester_id:friend.requester_id,accept:true})});renderFriends();
          });
        }else card=socialCard(friend.name,`${friend.email} · ${friend.status==='accepted'?(friend.online?'онлайн':'офлайн'):friend.status}`,null,null);
        list.append(card);
      });
    }catch(error){list.textContent=`Не удалось загрузить друзей: ${error.message}`}
  }
  $('sendFriendRequest').onclick=async()=>{
    const email=$('friendEmail').value.trim();const userId=await ensureMultiplayerIdentity();if(!userId||!email)return;
    try{
      const response=await fetch('/api/multiplayer/friends/request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requester_id:userId,email})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
      $('friendEmail').value='';notify(`Запрос отправлен: ${result.friend.name}`);renderFriends();
    }catch(error){notify(error.message)}
  };
  async function renderSharedToolbox(){
    const list=$('toolboxList');const userId=await ensureMultiplayerIdentity();if(!userId)return;
    try{
      const response=await fetch(`/api/multiplayer/toolbox?owner=${encodeURIComponent(userId)}`);
      const result=await response.json();if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
      list.replaceChildren();
      if(!result.items.length){list.textContent='Тулбокс пуст';return}
      result.items.forEach(item=>{
        list.append(socialCard(item.name,`${item.category} · сохранено ${item.updated_at}`,'Удалить',async()=>{
          if(!confirm(`Удалить «${item.name}» из тулбокса?`))return;
          await fetch('/api/multiplayer/toolbox/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,item_id:item.id})});renderSharedToolbox();
        }));
      });
    }catch(error){list.textContent=`Не удалось загрузить тулбокс: ${error.message}`}
  }
  $('addToolboxFromSelection').onclick=async()=>{
    const selection=currentSelection();if(!selection.length){notify('Сначала выделите объект для тулбокса');return}
    const userId=await ensureMultiplayerIdentity();if(!userId)return;
    const name=prompt('Название детали тулбокса:',selection.length===1?(selection[0].name||selection[0].type||'Деталь'):'Набор деталей');
    if(!name||!name.trim())return;
    const data=selection.map(object=>JSON.parse(JSON.stringify(object)));
    try{
      const response=await fetch('/api/multiplayer/toolbox',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,name:name.trim(),category:'object',data:{objects:data}})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
      notify(`Деталь сохранена в общий тулбокс: ${result.item.name}`);renderSharedToolbox();
    }catch(error){notify(error.message)}
  };
  $('socialNewProject').onclick=async()=>{
    if(!apiReady){notify('Создание облачных проектов требует отдельно размещённого API; текущий проект сохраняется в браузере');return}
    const userId=await ensureMultiplayerIdentity();if(!userId)return;
    const name=prompt('Название проекта:','Новый проект');if(!name||!name.trim())return;
    try{
      const response=await fetch('/api/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name.trim(),owner_id:userId})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
      await loadProject(result.id);$('socialModal').classList.add('hidden');
    }catch(error){notify(error.message)}
  };
  $('openSocial').onclick=()=>openSocial();$('closeSocial').onclick=()=>$('socialModal').classList.add('hidden');
  $('socialModal').addEventListener('pointerdown',event=>{if(event.target===$('socialModal'))$('socialModal').classList.add('hidden')});
  document.querySelectorAll('[data-social-tab]').forEach(button=>button.onclick=()=>openSocial(button.dataset.socialTab));
  $('mobileProperties').onclick=()=>$('propertiesView').parentElement.classList.toggle('mobile-open');
  function aiAccessAllowed(){
    if(desktopLocalAI)return true;
    try{return localStorage.getItem('floxzert-guest')==='false'&&JSON.parse(localStorage.getItem('floxzert-account')||'null')?.consent===true}
    catch(error){console.warn('AI account state could not be read',error);return false}
  }
  function updateAiAccess(){
    const allowed=aiAccessAllowed();
    $('openAssistant').disabled=!allowed;
    $('openAssistant').title=allowed?'Открыть ИИ-ассистента':'Войдите в локальный профиль, чтобы использовать ИИ';
    $('assistantPanel').classList.toggle('ai-locked',!allowed);
    $('assistantPanel').querySelectorAll('input,button,select').forEach(element=>{if(element.id!=='closeAssistant')element.disabled=!allowed});
    return allowed;
  }
  function requireAiAccess(){
    if(updateAiAccess())return true;
    $('assistantPanel').classList.add('hidden');
    $('settingsModal').classList.remove('hidden');
    document.querySelector('[data-settings-tab="account"]').click();
    notify('ИИ доступен после создания локального профиля');
    return false;
  }
  $('openAssistant').onclick=()=>{if(!requireAiAccess())return;$('settingsModal').classList.add('hidden');$('assistantPanel').classList.remove('hidden')};
  $('closeAssistant').onclick=()=>$('assistantPanel').classList.add('hidden');
  let lastAssistantPrompt='',lastAssistantAnswer='';
  let assistantConversation=[];
  $('aiSettingsToggle').onclick=()=>{
    if(!requireAiAccess())return;
    const fields=$('aiProviderFields');
    fields.classList.toggle('hidden');
    $('aiSettingsToggle').setAttribute('aria-expanded',String(!fields.classList.contains('hidden')));
  };
  function canvasContextForAI(){
    const visible=currentObjects().slice(-200);
    const context={
      width:canvas.width,height:canvas.height,frame:currentFrame,
      objects:visible.map(object=>({id:object.id,type:object.type,x:object.x,y:object.y,x2:object.x2,y2:object.y2,
        fill:object.fill,stroke:object.stroke,opacity:object.opacity,text:object.type==='text'?object.text?.slice(0,160):undefined})),
      selected:[...selectedIds].slice(0,50),
      layers:layers.filter(layer=>layer.visible).slice(0,100).map(layer=>({name:layer.name,visible:layer.visible}))
    };
    if($('aiSendCanvas').checked){
      const scale=Math.min(1,1024/canvas.width,768/canvas.height),previewCanvas=document.createElement('canvas');
      previewCanvas.width=Math.max(1,Math.round(canvas.width*scale));previewCanvas.height=Math.max(1,Math.round(canvas.height*scale));
      const previewContext=previewCanvas.getContext('2d');previewContext.scale(scale,scale);previewContext.fillStyle='#fbfaf7';previewContext.fillRect(0,0,canvas.width,canvas.height);
      currentObjects().forEach(object=>drawShape(previewContext,object));
      context.image=previewCanvas.toDataURL('image/jpeg',.58);
    }
    return context;
  }
  function applyAiActions(actions){
    if(!Array.isArray(actions)||!actions.length)return;
    const selected=currentSelection().filter(object=>!object.locked&&!layers.find(layer=>layer.id===object.layer)?.locked);
    if(actions.some(action=>['update_selected','delete_selected','duplicate_selected'].includes(action.type))&&!selected.length){
      notify('Выбери незаблокированный объект перед применением этих правок');return;
    }
    snapshot();
    for(const action of actions){
      if(action.type==='create_shape'&&['rect','roundrect','ellipse','triangle','line','star','polygon'].includes(action.shape)){
        if(!layers.find(layer=>layer.id===activeLayer)||layers.find(layer=>layer.id===activeLayer)?.locked)continue;
        const x=Math.max(0,Math.min(canvas.width-1,Number(action.x))),y=Math.max(0,Math.min(canvas.height-1,Number(action.y)));
        const width=Math.max(1,Math.min(canvas.width-x,Number(action.width))),height=Math.max(1,Math.min(canvas.height-y,Number(action.height)));
        const object={id:crypto.randomUUID(),type:action.shape,x,y,x2:x+width,y2:y+height,fill:action.fill||'#f0a36b',
          stroke:action.stroke||'#24242a',fillEnabled:action.shape!=='line',strokeEnabled:true,width:Math.max(0,Math.min(100,Number(action.strokeWidth)||0)),
          opacity:Math.max(0,Math.min(100,Number(action.opacity)||100)),layer:activeLayer,frame:currentFrame};
        objects.push(object);selectedIds=new Set([object.id]);selectedId=object.id;
      }else if(action.type==='update_selected'){
        selected.forEach(object=>{
          if(/^#[0-9a-f]{6}$/i.test(action.fill||'')){object.fill=action.fill;object.fillEnabled=true}
          if(/^#[0-9a-f]{6}$/i.test(action.stroke||'')){object.stroke=action.stroke;object.strokeEnabled=true}
          if(Number.isFinite(action.opacity))object.opacity=Math.max(0,Math.min(100,action.opacity));
          const dx=Math.max(-canvas.width,Math.min(canvas.width,Number(action.dx)||0)),dy=Math.max(-canvas.height,Math.min(canvas.height,Number(action.dy)||0));
          if(object.type==='stroke')object.points.forEach(point=>{point.x+=dx;point.y+=dy});
          else{object.x+=dx;object.y+=dy;if(object.x2!==undefined){object.x2+=dx;object.y2+=dy}}
        });
      }else if(action.type==='delete_selected'){
        const ids=new Set(selected.map(object=>object.id));objects=objects.filter(object=>!ids.has(object.id));selectedIds.clear();selectedId=null;
      }else if(action.type==='duplicate_selected'){
        const clones=selected.map(object=>{const clone=JSON.parse(JSON.stringify(object));clone.id=crypto.randomUUID();clone.frame=currentFrame;
          if(clone.type==='stroke')clone.points.forEach(point=>{point.x+=18;point.y+=18});
          else{clone.x+=18;clone.y+=18;if(clone.x2!==undefined){clone.x2+=18;clone.y2+=18}}
          return clone});
        objects.push(...clones);selectedIds=new Set(clones.map(object=>object.id));selectedId=clones[0]?.id||null;
      }
    }
    finishChange();notify('Изменения ИИ применены · отмена доступна через Ctrl+Z');
  }
  function normalizeFeatureLabel(value){
    return String(value||'').toLowerCase().replace(/ё/g,'е').replace(/[^a-z0-9а-я]+/g,' ').trim().replace(/\s+/g,' ')
  }
  function applyFeatureTogglePrompt(prompt){
    const text=normalizeFeatureLabel(prompt);
    const actionWords=new Set(['включи','включить','включите','активируй','активировать','enable','activate','выключи','выключить','выключите','отключи','отключить','отключите','деактивируй','деактивировать','disable','deactivate']);
    const promptWords=text.split(' ');
    const enableWords=new Set(['включи','включить','включите','активируй','активировать','enable','activate']);
    const disableWords=new Set(['выключи','выключить','выключите','отключи','отключить','отключите','деактивируй','деактивировать','disable','deactivate']);
    const enable=promptWords.some(word=>enableWords.has(word));
    const disable=promptWords.some(word=>disableWords.has(word));
    if(!enable&&!disable)return null;
    if(enable&&disable)return 'За один запрос можно включить или выключить один пункт каталога.';
    const stopWords=new Set(['пожалуйста','хочу','нужно','мне','функцию','функция','функции','функциях','функций','модуль','модуля','в','из','настройках','разделе','раздела','раздел','категории','категория','дополнительные','дополнительных']);
    const query=text.split(' ').filter(word=>!actionWords.has(word)&&!stopWords.has(word)).join(' ');
    if(!query)return 'Укажи название функции из раздела «Дополнительные функции».';
    const entries=[];
    (window.FloxFeatureCatalog||[]).forEach(([category,names])=>names.forEach(name=>entries.push({id:`catalog:${category}:${name}`,name,category})));
    document.querySelectorAll('#legacyFeatureGrid input[data-feature]').forEach(input=>{
      const name=input.closest('.feature-card')?.querySelector('b')?.textContent;
      if(name)entries.push({id:input.dataset.feature,name,category:'Дополнительные функции',legacyInput:input});
    });
    const categories=[...new Set(entries.map(entry=>normalizeFeatureLabel(entry.category)).filter(Boolean))];
    const requestedCategories=categories.filter(category=>text.includes(category));
    const categoryWords=new Set(requestedCategories.flatMap(category=>category.split(' ')));
    const featureQuery=query.split(' ').filter(word=>!categoryWords.has(word)).join(' ');
    const matches=entries.filter(entry=>{
      const name=normalizeFeatureLabel(entry.name);
      const category=normalizeFeatureLabel(entry.category);
      if(requestedCategories.length&&!requestedCategories.includes(category))return false;
      return featureQuery&&(name===featureQuery||(featureQuery.length>=4&&(name.includes(featureQuery)||featureQuery.includes(name))));
    });
    const uniqueMatches=[...new Map(matches.map(entry=>[entry.id,entry])).values()];
    if(!uniqueMatches.length)return 'Не нашёл это название в каталоге. Укажи точную подпись функции из настроек.';
    if(uniqueMatches.length>1)return `Уточни функцию и категорию: ${uniqueMatches.slice(0,5).map(entry=>`«${entry.name}» (${entry.category})`).join('; ')}${uniqueMatches.length>5?'…':''}.`;
    const target=uniqueMatches[0],enabled=enable;
    settings.features[target.id]=enabled;
    if(target.legacyInput)target.legacyInput.checked=enabled;
    const control=[...document.querySelectorAll('#featureCatalog input[data-feature-id]')].find(input=>input.dataset.featureId===target.id);
    if(control){
      control.checked=enabled;
      const status=control.closest('.feature-card')?.querySelector('small');
      if(status)status.textContent=enabled?'Флаг включён · модуль может быть недоступен':'Флаг выключен';
    }
    save();
    return `Флаг «${target.name}» ${enabled?'включён':'выключен'} и сохранён. Сам флаг не реализует модуль, если его ещё нет в приложении.`;
  }
  function localFloxZertReply(prompt,actionResult=''){
    const text=prompt.toLowerCase(),name=$('aiProviderMode').value==='flox'?'Flox':'Flox Mini';
    if(actionResult)return `Готово. ${actionResult}`;
    if(/привет|здравств|добрый день|хай/.test(text))return `Привет! Я ${name} 0.1.0.1. Напиши, что хочешь сделать или обсудить.`;
    if(/кто ты|как тебя зовут|что ты такое/.test(text))return `Я ${name} 0.1.0.1 — локальный ассистент Flox Zert.`;
    if(/что умеешь|помощь|что можешь/.test(text))return `Я ${name} могу учитывать холст, создавать базовые фигуры и предлагать правки выделенных объектов.`;
    if(/спасибо|благодар/.test(text))return 'Пожалуйста! Напиши, если понадобится ещё помощь.';
    if(/пока|до свидан/.test(text))return 'Пока! Возвращайся, когда понадобится помощь.';
    return `Я ${name} 0.1.0.1. Рисование и ИИ-сглаживание Flox работают прямо в браузере. Статический сайт можно публиковать на GitHub Pages; аккаунты и синхронизация требуют отдельного backend, а генеративный чат на статическом релизе пока не подключён.`;
  }
  $('assistantForm').onsubmit=async e=>{
    e.preventDefault();
    if(!requireAiAccess())return;
    const input=$('assistantPrompt'),q=input.value.trim();
    if(!q)return;
    const sendButton=$('assistantForm').querySelector('button');
    sendButton.disabled=true;appendMessage(q,true);lastAssistantPrompt=q;
    assistantConversation.push({role:'user',content:q});
    const s=q.toLowerCase();
    const featureAction=/сглаж|выпрям/.test(s)?null:applyFeatureTogglePrompt(q);
    let answer='',actionResult='',actions=[];
    if(featureAction){actionResult=featureAction}
    else if(s.includes('пустой ключевой кадр')){$('addBlankKeyframe').click();actionResult='Создан пустой ключевой кадр активного слоя.'}
    else if(s.includes('ключевой кадр')||s.includes('keyframe')){$('addLayerKeyframe').click();actionResult='Создан ключевой кадр активного слоя.'}
    else if(s.includes('копир')&&s.includes('кадр')){$('copyFrame').click();actionResult='Содержимое текущего кадра скопировано в следующий.'}
    else if(s.includes('новый слой')||s.includes('добав')&&s.includes('слой')){$('addLayer').click();actionResult='Создан новый слой.'}
    else if(s.includes('onion')||s.includes('луков')){$('onionButton').click();actionResult='Onion skinning переключён.'}
    else if(s.includes('размыт')){setTool('blur');actionResult='Выбран инструмент размытия. Кликни по объекту на холсте.'}
    else if(s.includes('экспорт')){exportPNG();actionResult='Выполнен экспорт сцены в PNG.'}
    else if(s.includes('очист')){snapshot();objects=objects.filter(o=>o.frame!==currentFrame);finishChange();actionResult='Текущий кадр очищен.'}
    else if(s.includes('порог')&&s.includes('дрож')){const value=Number(s.match(/\d+(?:[.,]\d+)?/)?.[0]?.replace(',','.'));if(!Number.isFinite(value))actionResult='Укажи порог дрожания от 1 до 30 пикселей.';else{$('smoothingJitter').value=Math.max(1,Math.min(30,Math.round(value)));$('smoothingJitter').dispatchEvent(new Event('input'));actionResult=`Порог дрожания: ${$('smoothingJitter').value} px.`}}
    else if(s.includes('сглаж')||s.includes('выпрям')){if(s.includes('выключ')||s.includes('отключ'))settings.curve_smoothing='off';else if(s.includes('по кноп')||s.includes('ручн'))settings.curve_smoothing='manual';else if(s.includes('дуг'))settings.curve_smoothing='curves';else if(s.includes('прям'))settings.curve_smoothing='straight';else if(s.includes('лёгк')||s.includes('легк'))settings.curve_smoothing='light';else if(s.includes('сильн'))settings.curve_smoothing='strong';else if(s.includes('идеаль'))settings.curve_smoothing='geometry';else if(s.includes('ии')||s.includes('флокс')||s.includes('flox'))settings.curve_smoothing='flox_ai';else settings.curve_smoothing='auto';settings.curve_smoothing_enabled=settings.curve_smoothing!=='off';$('smoothingMode').value=settings.curve_smoothing;$('smoothingEnabled').checked=settings.curve_smoothing_enabled;save();actionResult=`Режим сглаживания: ${$('smoothingMode').selectedOptions[0].textContent}.`}
    if(apiReady){
      try{
        const request={prompt:q,history:assistantConversation.slice(-12),action_result:actionResult,
          canvas_context:canvasContextForAI(),max_output_tokens:Number($('aiMaxOutputTokens').value)};
        const response=await fetch('/api/ai/answer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)});
        const result=await response.json();
        if(response.ok&&result.answer){
          answer=result.answer;actions=Array.isArray(result.actions)?result.actions:[];
          const modelName=AI_PROVIDER_NAMES[result.source]||result.source;
          const engine=result.engine?` · ${AI_PROVIDER_NAMES[result.engine]||result.engine}`:'';
          const usedTokens=result.usage?.totalTokenCount||result.usage?.output_tokens||result.usage?.completion_tokens;
          $('aiModelStatus').textContent=usedTokens?`${modelName}${engine} · ${usedTokens} токенов`:
            `${modelName}${engine} · ${['flox-mini','flox'].includes(result.source)?'локально':'расход не сообщил провайдер'}`;
        }else if(result.error){
          answer=`Не удалось получить ответ: ${result.error}`;
          $('aiModelStatus').textContent='Проверь API-ключ и настройки модели.';
        }
      }catch(error){console.error('AI request failed',error);answer='Не удалось связаться с сервером Flox Zert.';$('aiModelStatus').textContent='Сервер Flox Zert недоступен.'}
    }else answer=localFloxZertReply(q,actionResult);
    assistantConversation.push({role:'assistant',content:answer});
    lastAssistantAnswer=answer;
    appendMessage(answer,false,actions);
    input.value='';sendButton.disabled=false;input.focus();
  };
  function appendMessage(text,user,actions=[]){
    const d=document.createElement('div');d.className='assistant-message';d.textContent=text;
    if(user)d.style.cssText='margin:10px 0 10px 34px;background:#3a2d29;color:#f1c6a7';
    $('assistantMessages').appendChild(d);
    if(!user&&actions.length){
      const apply=document.createElement('button');apply.type='button';apply.className='ai-action-apply';
      apply.textContent=`Применить предложенные изменения (${actions.length})`;
      apply.onclick=()=>{if(!requireAiAccess())return;apply.disabled=true;applyAiActions(actions)};
      $('assistantMessages').appendChild(apply);
    }
    $('assistantMessages').scrollTop=$('assistantMessages').scrollHeight;
  }
  $('approveLastAssistant').onclick=async()=>{
    if(!lastAssistantPrompt||!lastAssistantAnswer){notify('Сначала задайте ассистенту команду');return}
    if(!apiReady){notify('Память и сохранение примеров ИИ требуют подключённого API или desktop-версии; сглаживание Flox работает без них');return}
    try{
      const response=await fetch('/api/ai/examples',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:lastAssistantPrompt,response:lastAssistantAnswer,approved:true})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
      await aiExampleCount();
      notify('Ответ сохранён как одобренный пример локального ИИ');
    }catch(error){notify(`Не удалось сохранить пример: ${error.message}`)}
  };
  async function aiExampleCount(){
    try{const response=await fetch('/api/ai/examples');const result=await response.json();if(!response.ok)return 0;const memory=result.memory||{};$('assistantLearningStatus').textContent=`Память: ${memory.used_tokens_estimate||0} / ${memory.limit_tokens||150000} токенов · ${memory.examples||0} примеров`;return memory.examples||0}catch(error){console.warn('AI memory status unavailable',error);return 0}
  }
  function updateAiProviderFields(){
    const mode=$('aiProviderMode').value,models=AI_MODELS[mode]||AI_MODELS.floxzert;
    const modelSelect=$('aiProviderModel'),previous=modelSelect.value;
    modelSelect.replaceChildren(...models.map(model=>{const option=document.createElement('option');option.value=model;option.textContent=model;return option}));
    if(models.includes(previous))modelSelect.value=previous;
    const own=['flox-mini','flox','floxzert'].includes(mode),custom=mode==='custom';
    $('aiProviderKey').classList.toggle('hidden',own);
    $('aiProviderKey').required=!own;
    $('aiProviderEndpoint').classList.toggle('hidden',!custom);
    $('aiCustomModel').classList.toggle('hidden',!custom);
    modelSelect.classList.toggle('hidden',custom);
    $('aiFloxUseGemini').parentElement.classList.toggle('hidden',!own);
    $('aiFloxGeminiModelLabel').classList.toggle('hidden',!own);
    $('aiModelStatus').textContent=own?`${AI_PROVIDER_NAMES[mode]} работает локально; Gemini можно отдельно включить как удалённый движок.`:`Модель провайдера: ${AI_PROVIDER_NAMES[mode]}. Нужен API-ключ.`;
    $('assistantModelLabel').textContent=own?`${AI_PROVIDER_NAMES[mode]} · 0.1.0.1`:`${AI_PROVIDER_NAMES[mode]} · ${modelSelect.value||'выбери модель'}`;
  }
  let localAiStatusTimer=null;
  function setDesktopAIStatus(text){
    $('aiModelStatus').textContent=text;
    $('desktopAiStatus').textContent=text;
  }
  function setupDesktopLocalAI(){
    if(!desktopLocalAI)return;
    const modeSelect=$('aiProviderMode');
    [...modeSelect.options].forEach(option=>{if(option.value!=='flox')option.remove()});
    modeSelect.value='flox';modeSelect.disabled=true;
    $('aiProviderModel').parentElement.classList.add('hidden');
    $('aiProviderKey').classList.add('hidden');
    $('aiProviderEndpoint').classList.add('hidden');
    $('aiCustomModel').classList.add('hidden');
    $('aiFloxUseGemini').parentElement.classList.add('hidden');
    $('aiFloxGeminiModelLabel').classList.add('hidden');
    $('aiIncludeApprovedMemory').parentElement.classList.add('hidden');
    $('aiSendCanvas').parentElement.classList.add('hidden');
    $('aiSendCanvas').checked=true;
    [...$('aiMaxOutputTokens').options].forEach(option=>{if(Number(option.value)>2048)option.remove()});
    $('aiVisionNotice').textContent='Локальная vision-модель работает на этом компьютере. После загрузки модели интернет не нужен; холст и сообщения не отправляются в облако.';
    $('assistantModelLabel').textContent='Flox · локальная vision-модель';
    $('assistantMessages').firstElementChild.textContent='Привет! Я Flox. После загрузки локальной модели смогу анализировать текст и изображение текущего холста.';
    $('desktopAiInstallPanel').classList.remove('hidden');
    const install=$('installLocalAi');
    install.title='Загрузить локальную модель и проверенный runtime llama.cpp';
    install.onclick=async()=>{
      if(!requireAiAccess())return;
      install.disabled=true;
      try{
        const response=await fetch('/api/ai/local/install',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
        const result=await response.json();
        if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
        await refreshDesktopLocalAIStatus();
      }catch(error){
        install.disabled=false;
        setDesktopAIStatus(`Не удалось начать загрузку: ${error.message}`);
      }
    };
    setDesktopAIStatus('Проверяю состояние локальной модели…');
    void refreshDesktopLocalAIStatus();
  }
  async function refreshDesktopLocalAIStatus(){
    if(!desktopLocalAI)return;
    if(!apiReady){
      setDesktopAIStatus('Локальный сервер недоступен. Перезапустите desktop-приложение.');
      return;
    }
    try{
      const response=await fetch('/api/ai/local/status');
      const status=await response.json();
      if(!response.ok)throw new Error(status.error||`HTTP ${response.status}`);
      const install=$('installLocalAi');
      if(status.state==='downloading'){
        const percent=Math.min(100,Math.floor(status.downloaded_bytes*100/status.total_bytes));
        if(install){install.disabled=true;install.textContent=`Загрузка ИИ · ${percent}%`}
        setDesktopAIStatus(`Загрузка ${status.current_file||'локальной модели'} · ${percent}% · не закрывайте приложение`);
        if(!localAiStatusTimer)localAiStatusTimer=setTimeout(()=>{localAiStatusTimer=null;void refreshDesktopLocalAIStatus()},1000);
      }else if(status.installed){
        if(install){install.disabled=true;install.textContent='Локальная модель установлена'}
        setDesktopAIStatus(status.state==='running'
          ?`Локальная модель запущена (${status.execution_mode==='cpu'?'CPU':'GPU'}); можно работать без интернета.`
          :'Локальная модель готова к работе офлайн; загрузится в память при первом сообщении.');
      }else if(status.state==='failed'){
        if(install){install.disabled=false;install.textContent='Повторить загрузку ИИ'}
        setDesktopAIStatus(`Ошибка загрузки: ${status.error||'неизвестная ошибка'}`);
      }else{
        if(install){install.disabled=false;install.textContent='Загрузить ИИ (~2,3 ГБ)'}
        setDesktopAIStatus('Модель ещё не загружена. Первое скачивание (~2,3 ГБ) требует интернет; после загрузки Flox работает офлайн.');
      }
      if(status.memory){
        $('assistantLearningStatus').textContent=`Память: ${status.memory.used_tokens_estimate||0} / ${status.memory.limit_tokens||500000} примерно оценённых токенов · ${status.memory.examples||0} одобренных примеров · хранится локально`;
      }
    }catch(error){
      console.warn('Local AI status unavailable',error);
      setDesktopAIStatus(`Статус локальной модели недоступен: ${error.message}`);
    }
  }
  $('aiProviderMode').onchange=updateAiProviderFields;
  $('aiProviderModel').onchange=()=>{$('assistantModelLabel').textContent=`${AI_PROVIDER_NAMES[$('aiProviderMode').value]} · ${$('aiProviderModel').value}`};
  $('aiCustomModel').oninput=()=>{$('assistantModelLabel').textContent=`${AI_PROVIDER_NAMES.custom} · ${$('aiCustomModel').value||'model-id'}`};
  $('aiMaxOutputTokens').onchange=()=>{$('aiModelStatus').textContent=`Максимум ответа: ${Number($('aiMaxOutputTokens').value).toLocaleString('ru-RU')} токенов`};
  updateAiProviderFields();
  setupDesktopLocalAI();
  async function loadAiProvider(){
    if(!apiReady||!aiAccessAllowed())return;
    try{
      const response=await fetch('/api/ai/provider');
      const result=await response.json();
      if(!response.ok)return;
      const provider=result.provider;
      const mode=desktopLocalAI?'flox':['flox-mini','flox','gemini','openai','anthropic','deepseek','custom'].includes(provider.mode)?provider.mode:provider.mode==='internet'?'custom':'flox-mini';
      $('aiProviderMode').value=mode;updateAiProviderFields();
      if(desktopLocalAI){$('aiProviderMode').disabled=true;setupDesktopLocalAI()}
      if(mode==='custom'){$('aiCustomModel').value=provider.model||'';$('aiProviderEndpoint').value=provider.endpoint||''}
      else if(provider.model&&[...$('aiProviderModel').options].some(option=>option.value===provider.model))$('aiProviderModel').value=provider.model;
      const savedMaxTokens=Number(provider.max_output_tokens||1200);
      const maxTokensOption=[...$('aiMaxOutputTokens').options].find(option=>Number(option.value)===(desktopLocalAI?Math.min(2048,savedMaxTokens):savedMaxTokens));
      $('aiMaxOutputTokens').value=maxTokensOption?maxTokensOption.value:'1200';
      $('aiMemoryLimit').value=String(provider.memory_limit_tokens||(desktopLocalAI?500000:150000));
      $('aiIncludeApprovedMemory').checked=provider.include_approved_memory===true;
      $('aiFloxUseGemini').checked=provider.flox_use_gemini===true;
      $('aiFloxGeminiModel').value=provider.flox_gemini_model||'gemini-2.5-flash';
      $('aiSendCanvas').checked=desktopLocalAI||provider.send_canvas!==false;
      $('aiProviderKey').value='';
      $('assistantModelLabel').textContent=['flox-mini','flox'].includes(mode)?`${AI_PROVIDER_NAMES[mode]} · 0.1.0.1`:`${AI_PROVIDER_NAMES[mode]} · ${provider.model||$('aiProviderModel').value}`;
      $('aiModelStatus').textContent=desktopLocalAI?'Проверяю локальную vision-модель…':provider.configured?`Модель настроена.${provider.has_gemini_brain_key?' Gemini-движок сохранён.':''}`:'Локальный режим';
      await aiExampleCount();
      if(desktopLocalAI)await refreshDesktopLocalAIStatus();
    }catch(error){console.warn('Could not load AI provider',error)}
  }
  $('saveAiProvider').onclick=async()=>{
    if(!requireAiAccess())return;
    if(!apiReady){notify('Настройка чат-провайдера требует отдельно размещённого API; не публикуйте секретные ключи в статическом сайте');return}
    const mode=desktopLocalAI?'flox':$('aiProviderMode').value,enabled=!['flox-mini','flox','floxzert'].includes(mode);
    const payload={enabled,mode,endpoint:mode==='custom'?$('aiProviderEndpoint').value.trim():'',
      model:mode==='custom'?$('aiCustomModel').value.trim():$('aiProviderModel').value,api_key:$('aiProviderKey').value.trim(),
      max_output_tokens:Number($('aiMaxOutputTokens').value),memory_limit_tokens:Number($('aiMemoryLimit').value),
      include_approved_memory:$('aiIncludeApprovedMemory').checked,flox_use_gemini:$('aiFloxUseGemini').checked,
      flox_gemini_model:$('aiFloxGeminiModel').value,send_canvas:$('aiSendCanvas').checked};
    try{
      const response=await fetch('/api/ai/provider',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
      $('aiProviderKey').value='';
      $('assistantModelLabel').textContent=enabled?`${AI_PROVIDER_NAMES[mode]} · ${payload.model}`:`${AI_PROVIDER_NAMES[mode]} · 0.1.0.1`;
      $('aiModelStatus').textContent=enabled?'Настройки модели сохранены.':`Настройки ${AI_PROVIDER_NAMES[mode]} сохранены.`;
      $('aiProviderFields').classList.add('hidden');$('aiSettingsToggle').setAttribute('aria-expanded','false');
      notify(enabled?`Провайдер ${AI_PROVIDER_NAMES[mode]} сохранён`:`Выбрана ${AI_PROVIDER_NAMES[mode]} 0.1.0.1`);
    }catch(error){notify(error.message)}
  };
  $('saveSelection').onclick=()=>notify('Сохранение выделения в альфа-канал пока не реализовано');
  $('invertSelection').onclick=()=>notify('Инверсия выделения пока не реализована');
  $('newScene').onclick=()=>notify('Сцены и переходы между ними пока не реализованы');
  $('groupLayers').onclick=()=>notify('Группы слоёв пока не реализованы');$('addMask').onclick=()=>notify('Маски слоёв пока не реализованы');
  document.querySelectorAll('.selection-actions button').forEach(button=>button.onclick=()=>notify('Расширенные режимы выделения пока не реализованы'));
  function libraryObjects(asset){
    if(Array.isArray(asset?.objects))return asset.objects.filter(object=>object&&typeof object==='object');
    return asset&&typeof asset.type==='string'?[asset]:[];
  }
  function renderAssetLibrary(){
    const list=$('assetList');
    if(!list)return;
    list.replaceChildren();
    if(!Array.isArray(assets)||!assets.length){
      const empty=document.createElement('div');empty.className='empty-assets';
      const icon=document.createElement('span');icon.textContent='✦';
      const title=document.createElement('strong');title.textContent='Пока пусто';
      const hint=document.createElement('small');hint.textContent='Выделите объекты и нажмите «Сохранить»';
      empty.append(icon,title,hint);list.append(empty);return;
    }
    assets.forEach((asset,index)=>{
      const objectsInAsset=libraryObjects(asset);
      const button=document.createElement('button');button.type='button';button.className='layer-item asset-library-item';
      button.disabled=!objectsInAsset.length;
      const icon=document.createElement('span');icon.className='layer-icon';icon.textContent='✦';
      const name=document.createElement('span');name.textContent=typeof asset.name==='string'&&asset.name.trim()?asset.name:`Элемент ${index+1}`;
      const count=document.createElement('span');count.className='layer-actions';count.textContent=String(objectsInAsset.length);
      button.title=objectsInAsset.length?`Добавить ${objectsInAsset.length} объект(а) на текущий кадр`:'В элементе нет объектов';
      button.setAttribute('aria-label',`${button.title}: ${name.textContent}`);
      button.append(icon,name,count);button.onclick=()=>loadLibraryAsset(asset);list.append(button);
    });
  }
  function saveSelectionToLibrary(){
    const selection=currentSelection();
    if(!selection.length){notify('Сначала выделите один или несколько объектов');return}
    const defaultName=selection.length===1
      ?selection[0].name||(selection[0].type==='text'?selection[0].text:selection[0].type)||'Элемент'
      :`Набор объектов ${assets.length+1}`;
    const name=$('assetNameInput').value.trim()||defaultName;
    assets.push({id:crypto.randomUUID(),name,objects:selection.map(object=>JSON.parse(JSON.stringify(object)))});
    $('assetNameInput').value='';
    renderAssetLibrary();save();
    notify(`В библиотеку сохранено объектов: ${selection.length}`);
  }
  function loadLibraryAsset(asset){
    const templates=libraryObjects(asset);
    if(!templates.length){notify('В выбранном элементе библиотеки нет объектов');return}
    const targetLayer=layers.find(layer=>layer.id===activeLayer&&!layer.locked)||layers.find(layer=>!layer.locked);
    if(!targetLayer){notify('Разблокируйте слой, чтобы добавить объекты');return}
    activeLayer=targetLayer.id;
    const offset=18;
    const copies=templates.map(template=>{
      const object=refreshObjectIds(JSON.parse(JSON.stringify(template)));
      setObjectLayerAndFrame(object,targetLayer.id,currentFrame);
      delete object.generatedTween;
      translateObjectGeometry(object,offset,offset);
      return object;
    });
    snapshot();objects.push(...copies);selectedIds=new Set(copies.map(object=>object.id));selectedId=copies[0].id;
    finishChange();notify(`На холст добавлено объектов: ${copies.length}`);
  }
  $('saveAsset').onclick=$('saveCurrentAsset').onclick=saveSelectionToLibrary;
  $('smoothingMode').onchange=e=>{settings.curve_smoothing=e.target.value;settings.curve_smoothing_enabled=e.target.value!=='off';$('smoothingEnabled').checked=settings.curve_smoothing_enabled;save()};
  $('smoothingEnabled').onchange=e=>{settings.curve_smoothing_enabled=e.target.checked;if(e.target.checked&&settings.curve_smoothing==='off'){settings.curve_smoothing='light';$('smoothingMode').value='light'}save();notify(e.target.checked?'Пассивное сглаживание включено':'Пассивное сглаживание выключено')};
  $('smoothingSensitivity').oninput=e=>{settings.smoothing_sensitivity=Number(e.target.value);$('smoothingSensitivityValue').textContent=`${e.target.value}%`;save()};
  $('smoothingJitter').oninput=e=>{settings.smoothing_jitter_threshold=Number(e.target.value);$('smoothingJitterValue').textContent=`${e.target.value} px`;save()};
  document.querySelectorAll('[data-feature]').forEach(input=>input.onchange=()=>{settings.features[input.dataset.feature]=input.checked;save()});
  $('straightenButton').onclick=()=>{
    const strokes=currentSelection().filter(object=>object.type==='stroke'),editable=editableSelection(strokes);
    if(!strokes.length){notify('Выберите один или несколько свободных штрихов');return}
    if(!editable.length){notify('Выпрямление недоступно: выбранные штрихи заблокированы');return}
    const replacements=editable.map(object=>({object,corrected:smoothStroke(object,true)})).filter(item=>item.corrected!==item.object);
    if(!replacements.length){notify('Выбранные штрихи слишком короткие для коррекции');return}
    snapshot();
    replacements.forEach(({object,corrected})=>{objects[objects.indexOf(object)]=corrected});
    finishChange();
    notify(`Исправлено штрихов: ${replacements.length}${editable.length<strokes.length?`; пропущено заблокированных: ${strokes.length-editable.length}`:''}`)
  };
  function showManager(title){$('managerTitle').textContent=title;$('managerBody').replaceChildren();$('managerModal').classList.remove('hidden')}
  function createManagerItem(title,detail,action,current=false){const button=document.createElement('button');button.type='button';button.className='manager-item'+(current?' current':'');const copy=document.createElement('span');copy.className='manager-item-copy';const name=document.createElement('b');name.textContent=title;const sub=document.createElement('small');sub.textContent=detail;copy.append(name,sub);const label=document.createElement('span');label.className='manager-item-action';label.textContent=current?'ОТКРЫТ':'ОТКРЫТЬ';button.append(copy,label);button.onclick=action;return button}
  async function loadProject(projectId){await flushSave();const response=await fetch(`/api/projects/${encodeURIComponent(projectId)}`);const project=await response.json();if(!response.ok)throw new Error(project.error||`HTTP ${response.status}`);currentProjectId=project.id;projectRevision=project.revision;projectDirty=false;saveBlocked=false;applyProjectData(project.data);localStorage.setItem('floxzert-project-id',currentProjectId);localStorage.setItem('floxzert-project',JSON.stringify(projectData()));history=[];redoStack=[];updateSaveStatus('Все изменения сохранены');renderLayers();renderTimeline();render()}
  $('projectSwitcher').onclick=async()=>{if(!apiReady){notify('Список облачных проектов требует подключённого API; текущий проект хранится в браузере');return}try{const response=await fetch('/api/projects');const result=await response.json();if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);showManager('Открыть проект');const body=$('managerBody'),list=document.createElement('div');list.className='manager-list';result.projects.forEach(project=>list.appendChild(createManagerItem(project.name,`Изменён ${project.updated_at} · версия ${project.revision}`,async()=>{try{await loadProject(project.id);$('managerModal').classList.add('hidden')}catch(error){showManagerError(error.message)}} ,project.id===currentProjectId)));body.appendChild(list);const form=document.createElement('form');form.className='manager-form';const input=document.createElement('input');input.name='name';input.maxLength=160;input.required=true;input.placeholder='Название нового проекта';const create=document.createElement('button');create.type='submit';create.textContent='Создать проект';form.append(input,create);form.onsubmit=async event=>{event.preventDefault();try{await flushSave();const createdResponse=await fetch('/api/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:input.value.trim()})});const created=await createdResponse.json();if(!createdResponse.ok)throw new Error(created.error||`HTTP ${createdResponse.status}`);currentProjectId=created.id;projectRevision=created.revision;projectDirty=false;saveBlocked=false;applyProjectData(created.data);localStorage.setItem('floxzert-project-id',currentProjectId);localStorage.setItem('floxzert-project',JSON.stringify(projectData()));history=[];redoStack=[];renderLayers();renderTimeline();render();$('managerModal').classList.add('hidden')}catch(error){showManagerError(error.message)}};body.appendChild(form)}catch(error){updateSaveStatus('Не удалось загрузить проекты','error');console.error('Project list failed',error)}};
  function showManagerError(message){const error=document.createElement('div');error.className='manager-error';error.textContent=message;$('managerBody').appendChild(error)}
  $('historyButton').onclick=async()=>{if(!apiReady||!currentProjectId){notify('История версий доступна при подключённом backend API; текущая копия сохраняется в браузере');return}try{const response=await fetch(`/api/projects/${encodeURIComponent(currentProjectId)}/revisions`);const result=await response.json();if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);const projectId=currentProjectId;showManager('История версий');const list=document.createElement('div');list.className='manager-list';result.revisions.forEach(revision=>list.appendChild(createManagerItem(`Версия ${revision.revision}`,revision.created_at,()=>{showManager('Восстановление версии');const message=document.createElement('p');message.className='manager-confirm';message.textContent=`Восстановить версию ${revision.revision}? Текущая версия останется в истории.`;const actions=document.createElement('div');actions.className='manager-confirm-actions';const cancel=document.createElement('button');cancel.type='button';cancel.className='secondary';cancel.textContent='Отмена';cancel.onclick=()=>$('historyButton').click();const confirmRestore=document.createElement('button');confirmRestore.type='button';confirmRestore.textContent='Восстановить';confirmRestore.onclick=async()=>{confirmRestore.disabled=true;try{await flushSave();const restoreResponse=await fetch(`/api/projects/${encodeURIComponent(projectId)}/restore`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:revision.revision,expected_revision:projectRevision})});const restored=await restoreResponse.json();if(!restoreResponse.ok)throw new Error(restored.error||`HTTP ${restoreResponse.status}`);projectRevision=restored.revision;projectDirty=false;saveBlocked=false;applyProjectData(restored.data);localStorage.setItem('floxzert-project',JSON.stringify(projectData()));history=[];redoStack=[];updateSaveStatus(`Восстановлена версия ${revision.revision}`);renderLayers();renderTimeline();render();$('managerModal').classList.add('hidden')}catch(error){showManagerError(error.message);confirmRestore.disabled=false}};actions.append(cancel,confirmRestore);$('managerBody').append(message,actions)} ,revision.revision===projectRevision)));$('managerBody').appendChild(list)}catch(error){updateSaveStatus('Не удалось загрузить историю','error');console.error('Version history failed',error)}};
  $('closeManager').onclick=()=>$('managerModal').classList.add('hidden');
  function renderFeatureCatalog(){
    const catalog=$('featureCatalog');
    if(!catalog||!window.FloxFeatureCatalog)return;
    const query=($('featureSearch')?.value||'').trim().toLowerCase();
    catalog.replaceChildren();
    let count=0;
    for(const [category,items] of window.FloxFeatureCatalog){
      const matches=items.filter(name=>!query||name.toLowerCase().includes(query)||category.toLowerCase().includes(query));
      if(!matches.length)continue;
      count+=matches.length;
      const section=document.createElement('section');
      section.className='feature-category';
      const title=document.createElement('h3');
      title.textContent=`${category} · ${matches.length}`;
      section.appendChild(title);
      const grid=document.createElement('div');
      grid.className='feature-grid';
      for(const name of matches){
        const id=`catalog:${category}:${name}`;
        const card=document.createElement('label');
        card.className='feature-card';
        const icon=document.createElement('span');
        icon.className='feature-icon';
        icon.textContent='◈';
        const copy=document.createElement('span');
        const b=document.createElement('b');
        b.textContent=name;
        const small=document.createElement('small');
        small.textContent=settings.features[id]?'Флаг включён · модуль может быть недоступен':'Флаг выключен';
        copy.append(b,small);
        const input=document.createElement('input');
        input.type='checkbox';
        input.dataset.featureId=id;
        input.checked=Boolean(settings.features[id]);
        input.onchange=()=>{
          settings.features[id]=input.checked;
          small.textContent=input.checked?'Флаг включён · модуль может быть недоступен':'Флаг выключен';
          save();
        };
        card.append(icon,copy,input);
        grid.appendChild(card);
      }
      section.appendChild(grid);
      catalog.appendChild(section);
    }
    if($('featureCount'))$('featureCount').textContent=`${count} функций`;
  }
  function applyTheme(name){
    const root=document.documentElement;
    if(name==='light'){root.style.colorScheme='light';root.style.setProperty('--bg','#edf2fa');root.style.setProperty('--panel','#f7f9fd');root.style.setProperty('--panel2','#e8eef8');root.style.setProperty('--line','#d3deeb');root.style.setProperty('--text','#172033');root.style.setProperty('--accent','#1677d2')}
    else if(name==='dark'){root.style.colorScheme='dark';root.style.setProperty('--bg','#0d1118');root.style.setProperty('--panel','#151b26');root.style.setProperty('--panel2','#202938');root.style.setProperty('--line','#293649');root.style.setProperty('--text','#edf4ff');root.style.setProperty('--accent','#60a5fa')}
    else {root.style.colorScheme='dark';root.style.setProperty('--bg',name==='custom'?settings.customTheme?.background||'#111722':'#111722');root.style.setProperty('--panel',name==='custom'?settings.customTheme?.panel||'#1a2230':'#1a2230');root.style.setProperty('--panel2','#202938');root.style.setProperty('--line','#2d3a4d');root.style.setProperty('--text','#edf4ff');root.style.setProperty('--accent',name==='custom'?settings.customTheme?.accent||'#3897f0':'#3897f0')}
    settings.theme=name;
    save();
  }
  function renderLearning(){
    const list=$('learningChecklist');
    if(!list)return;
    const steps=[
      'Выбрать инструмент','Нарисовать фигуру','Скопировать кадр','Изменить заливку','Изменить прозрачность','Размыть объект','Попробовать Ctrl+ЛКМ'
    ];
    list.replaceChildren();
    const progress=JSON.parse(localStorage.getItem('floxzert-learning')||'{}');
    const completed=steps.filter(step=>progress[step]).length;
    const progressRow=document.createElement('div');progressRow.className='learning-progress-row';
    progressRow.innerHTML=`<span>${completed} из ${steps.length} выполнено</span><div class="learning-progress-bar"><i style="width:${completed/steps.length*100}%"></i></div>`;
    list.appendChild(progressRow);
    for(const step of steps){
      const row=document.createElement('label');
      row.className='learning-item';
      const input=document.createElement('input');
      input.type='checkbox';
      input.checked=Boolean(progress[step]);
      input.onchange=()=>{progress[step]=input.checked;localStorage.setItem('floxzert-learning',JSON.stringify(progress));renderLearning()};
      const text=document.createElement('span');
      text.textContent=step;
      row.append(input,text);
      list.appendChild(row);
    }
  }
  function markLearningComplete(step){
    try{
      const progress=JSON.parse(localStorage.getItem('floxzert-learning')||'{}');
      progress[step]=true;
      localStorage.setItem('floxzert-learning',JSON.stringify(progress));
      renderLearning();
    }catch(error){console.warn('Could not update learning progress',error)}
  }
  if($('featureSearch'))$('featureSearch').oninput=renderFeatureCatalog;
  document.querySelectorAll('[data-theme]').forEach(button=>button.onclick=()=>applyTheme(button.dataset.theme));
  for(const id of ['themeAccent','themeBackground','themePanel']){
    if($(id))$(id).oninput=()=>{
      const property=id==='themeAccent'?'accent':id==='themeBackground'?'background':'panel';
      document.documentElement.style.setProperty(property==='accent'?'--accent':property==='background'?'--bg':'--panel',$(id).value);
      settings.theme='custom';
      settings.customTheme={accent:$('themeAccent').value,background:$('themeBackground').value,panel:$('themePanel').value};
      save();
    };
  }
  async function createLocalCredential(password){
    const salt=crypto.getRandomValues(new Uint8Array(16));
    const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
    const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:120000,hash:'SHA-256'},base,256);
    const bytes=new Uint8Array(bits);
    return {algorithm:'PBKDF2-SHA256',iterations:120000,salt:Array.from(salt),hash:Array.from(bytes)};
  }
  let accountMode='register',captchaToken='',captchaWidgetId=null;
  function setAccountMode(mode){
    accountMode=mode;
    const cloudEnabled=Boolean(cloudApiBase),registering=mode==='register';
    $('accountEmail').required=cloudEnabled;
    $('accountNameField').classList.toggle('hidden',cloudEnabled&&!registering);
    $('accountName').required=cloudEnabled&&registering;
    $('accountPasswordConfirmField').classList.toggle('hidden',cloudEnabled&&!registering);
    $('accountPasswordConfirm').required=cloudEnabled&&registering;
    $('accountConsentField').classList.toggle('hidden',cloudEnabled&&!registering);
    $('accountConsent').required=cloudEnabled&&registering;
    $('accountAvatarField').classList.toggle('hidden',cloudEnabled);
    $('accountPlanField').classList.toggle('hidden',cloudEnabled);
    $('accountCaptcha').classList.toggle('hidden',!cloudEnabled||desktopLocalAI||!turnstileSiteKey||!registering);
    $('accountModeToggle').classList.toggle('hidden',!cloudEnabled);
    $('accountLogout').classList.toggle('hidden',!cloudEnabled||!localStorage.getItem('floxzert-cloud-token'));
    $('accountSubmit').textContent=cloudEnabled?(registering?'Создать аккаунт':'Войти'):'Сохранить локальный профиль';
    $('accountModeToggle').textContent=registering?'Уже есть аккаунт? Войти':'Нет аккаунта? Зарегистрироваться';
    $('accountPassword').autocomplete=cloudEnabled&&!registering?'current-password':'new-password';
    if(cloudEnabled&&registering&&captchaWidgetId!==null&&window.turnstile){
      captchaToken='';
      window.turnstile.reset(captchaWidgetId);
    }
    if(cloudEnabled&&registering&&!desktopLocalAI)initializeAccountCaptcha();
  }
  function initializeAccountCaptcha(){
    if(!cloudApiBase||desktopLocalAI||!turnstileSiteKey||accountMode!=='register')return;
    const mountCaptcha=()=>{
      if(!window.turnstile||captchaWidgetId!==null)return;
      captchaWidgetId=window.turnstile.render($('accountCaptcha'),{
        sitekey:turnstileSiteKey,
        callback:token=>{captchaToken=token},
        'expired-callback':()=>{captchaToken=''},
        'error-callback':()=>{captchaToken=''}
      });
    };
    if(window.turnstile){mountCaptcha();return}
    if(document.getElementById('cloudflare-turnstile-script'))return;
    const script=document.createElement('script');
    script.id='cloudflare-turnstile-script';
    script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async=true;script.defer=true;
    script.onload=mountCaptcha;
    script.onerror=()=>{$('accountStatus').textContent='Не удалось загрузить проверку Cloudflare Turnstile.'};
    document.head.appendChild(script);
  }
  async function submitCloudAccount(){
    const registering=accountMode==='register',email=$('accountEmail').value.trim(),password=$('accountPassword').value;
    if(password.length<10||password.length>128)throw new Error('Пароль должен содержать от 10 до 128 символов');
    if(registering){
      if($('accountName').value.trim().length<1)throw new Error('Укажите имя профиля');
      if(password!==$('accountPasswordConfirm').value)throw new Error('Пароли не совпадают');
      if(!$('accountConsent').checked)throw new Error('Нужно принять условия и политику конфиденциальности');
      if(!desktopLocalAI&&!turnstileSiteKey)throw new Error('Веб-проверка CAPTCHA ещё не настроена владельцем сервиса');
      if(!desktopLocalAI&&!captchaToken)throw new Error('Пройдите проверку человека перед регистрацией');
    }
    const response=await fetch(registering?'/api/auth/register':'/api/auth/login',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        email,password,
        ...(registering?{name:$('accountName').value.trim(),consent:$('accountConsent').checked,captcha_token:desktopLocalAI?'':captchaToken}:{})
      })
    });
    const result=await response.json();
    if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
    if(typeof result.token!=='string'||!result.user?.email)throw new Error('Сервер вернул неполные данные аккаунта');
    localStorage.setItem('floxzert-cloud-token',result.token);
    const profile={
      email:result.user.email,name:result.user.name||'',
      language:$('accountLanguage').value,
      timezone:$('accountTimezone').value,
      plan:result.user.plan||'free',consent:true
    };
    localStorage.setItem('floxzert-account',JSON.stringify(profile));
    localStorage.setItem('floxzert-guest','false');
    $('accountName').value=profile.name;
    $('accountStatus').textContent=`Вход выполнен: ${profile.name||profile.email} · облачная синхронизация включена`;
    $('accountPassword').value='';$('accountPasswordConfirm').value='';
    captchaToken='';
    setAccountMode('login');
    updateAiAccess();
    await initializeProjectStorage();
    if(!apiReady)throw new Error('Вход выполнен, но облачный проект не загрузился. Локальная копия сохранена; проверьте подключение и повторите попытку.');
    loadAiProvider();
    notify(registering?'Аккаунт создан, проекты синхронизируются':'Вход выполнен, проекты синхронизируются');
  }
  if($('accountForm'))$('accountForm').onsubmit=async e=>{
    e.preventDefault();
    const submitButton=e.submitter||$('accountForm').querySelector('[type="submit"]');
    submitButton.disabled=true;
    try{
      if(cloudApiBase){
        await submitCloudAccount();
        return;
      }
      if(!$('accountConsent').checked)throw new Error('Нужно принять условия и политику конфиденциальности');
    const password=$('accountPassword').value,confirmation=$('accountPasswordConfirm').value;
    const previous=JSON.parse(localStorage.getItem('floxzert-account')||'null');
    if(password||confirmation){
      if(password.length<10){throw new Error('Пароль должен содержать минимум 10 символов')}
      if(password!==confirmation)throw new Error('Пароли не совпадают');
    }else if(!previous?.credential)throw new Error('Укажите пароль минимум из 10 символов');
    let credential=previous?.credential;
    if(password)credential=await createLocalCredential(password);
    const profile={
      email:$('accountEmail').value.trim(),
      name:$('accountName').value.trim(),
      language:$('accountLanguage').value,
      timezone:$('accountTimezone').value,
      plan:$('accountPlan').value,
      consent:true,
      avatar:localStorage.getItem('floxzert-account-avatar')||'',
      credential
    };
    localStorage.setItem('floxzert-account',JSON.stringify(profile));
    localStorage.setItem('floxzert-guest','false');
    updateAiAccess();
    loadAiProvider();
    if(apiReady&&!cloudApiBase){
      fetch('/api/multiplayer/identity',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:profile.email,name:profile.name,plan:profile.plan})})
        .then(response=>response.json()).then(result=>{if(result.user)multiplayerUserId=result.user.id}).catch(error=>console.warn('Multiplayer identity could not be registered',error));
    }
    const planLimits={free:'100 ИИ-токенов/день',creator:'500 ИИ-токенов/день',team:'2 000 ИИ-токенов/день'};
    $('accountStatus').textContent=`Локальный профиль: ${profile.name||profile.email||'без имени'} · ${planLimits[profile.plan]} · облачная синхронизация отключена`;
    $('accountPassword').value='';$('accountPasswordConfirm').value='';
    notify('Локальный профиль сохранён');
    }catch(error){
      notify(error.message||'Не удалось сохранить аккаунт');
      if(cloudApiBase&&localStorage.getItem('floxzert-cloud-token'))$('accountStatus').textContent='Вход выполнен, но облачная синхронизация не установлена. Локальная копия сохранена.';
      console.error('Account request failed',error);
    }finally{
      submitButton.disabled=false;
    }
  };
  $('accountModeToggle').onclick=()=>setAccountMode(accountMode==='register'?'login':'register');
  $('accountLogout').onclick=async()=>{
    const button=$('accountLogout');
    button.disabled=true;
    try{
      const response=await fetch('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
      localStorage.removeItem('floxzert-cloud-token');
      $('accountStatus').textContent='Вы вышли из облачного аккаунта; локальная копия проекта сохранена';
      setAccountMode('register');
      updateAiAccess();
      await initializeProjectStorage();
      notify('Вы вышли из аккаунта');
    }catch(error){
      notify(error.message||'Не удалось завершить сеанс на сервере');
      console.error('Cloud logout failed',error);
    }finally{
      button.disabled=false;
    }
  };
  document.querySelectorAll('[data-settings-tab]').forEach(button=>button.onclick=()=>{const tab=button.dataset.settingsTab;document.querySelectorAll('[data-settings-tab]').forEach(item=>item.classList.toggle('selected',item===button));
    $('settingsBody').classList.toggle('hidden',tab!=='features');
    $('themesView').classList.toggle('hidden',tab!=='themes');
    $('accountView').classList.toggle('hidden',tab!=='account');
    $('learningView').classList.toggle('hidden',tab!=='learning');
    $('shortcutsView').classList.toggle('hidden',tab!=='shortcuts');
    if(tab==='assistant'){if(!requireAiAccess())return;$('settingsModal').classList.add('hidden');$('assistantPanel').classList.remove('hidden') }
    if(tab==='features')renderFeatureCatalog();
    if(tab==='shortcuts')renderShortcutList();
    if(tab==='learning')renderLearning();
  });
  $('shortcutSearch').oninput=renderShortcutList;
  $('enableShortcuts').onclick=enableAvailableShortcuts;
  $('exportShortcutProfile').onclick=exportShortcutProfile;
  $('importShortcutProfile').onclick=()=>$('shortcutProfileFile').click();
  $('shortcutProfileFile').onchange=event=>{const file=event.target.files?.[0];if(file)importShortcutProfile(file)};
  $('resetShortcuts').onclick=()=>{if(!confirm('Сбросить все пользовательские сочетания и параметры к стандартным?'))return;settings.shortcuts={};settings.shortcut_enabled={};settings.shortcut_options={};recordingShortcut=null;clearPendingShortcutStates();save();renderShortcutList()};
  $('paletteSearch').oninput=()=>{paletteIndex=0;renderCommandPalette()};
  $('paletteModal').addEventListener('pointerdown',event=>{if(event.target===$('paletteModal'))$('paletteModal').classList.add('hidden')});
  document.querySelectorAll('.panel-tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.panel-tab').forEach(x=>x.classList.toggle('active',x===b));['properties','layers','assets'].forEach(x=>$(`${x}View`).classList.toggle('hidden',b.dataset.panel!==x))});
  const onboardingSteps=[
    {selector:'[data-tool="brush"]',title:'Кисть и рисование',description:'Выберите кисть в левой панели и проведите мышью или стилусом по холсту.'},
    {selector:'#copyFrame',title:'Копирование кадра',description:'Кнопка копирования кадра переносит текущее содержимое на следующий кадр.'},
    {selector:'#fillEnabled',title:'Заливка и прозрачность',description:'Включите заливку и настройте непрозрачность для объекта или активного слоя.'},
    {selector:'[data-tool="blur"]',title:'Размытие объекта',description:'Выберите инструмент размытия, затем кликните по нужному объекту.'},
    {selector:'#artboard',title:'Мультивыделение',description:'Зажмите Ctrl или Cmd и последовательно кликните по элементам, которые нужно выделить вместе.'}
  ];
  let tourIndex=-1;
  function clearTourHighlights(){document.querySelectorAll('.tour-highlight').forEach(element=>element.classList.remove('tour-highlight'))}
  function showTourStep(index){
    tourIndex=Math.max(0,Math.min(onboardingSteps.length-1,index));clearTourHighlights();
    const step=onboardingSteps[tourIndex],target=document.querySelector(step.selector);
    $('welcomeContent').classList.add('hidden');$('tourPanel').classList.remove('hidden');
    $('tourProgressText').textContent=`Шаг ${tourIndex+1} из ${onboardingSteps.length}`;
    $('tourProgressBar').style.width=`${(tourIndex+1)/onboardingSteps.length*100}%`;
    $('tourTitle').textContent=step.title;$('tourDescription').textContent=step.description;
    $('tourBack').disabled=tourIndex===0;
    $('tourNext').textContent=tourIndex===onboardingSteps.length-1?'Готово':'Далее';
    if(target){target.classList.add('tour-highlight');target.scrollIntoView?.({block:'nearest',behavior:'smooth'})}
  }
  function finishTour(){
    clearTourHighlights();localStorage.setItem('floxzert-welcome','seen');localStorage.setItem('floxzert-guest',localStorage.getItem('floxzert-guest')||'true');
    $('welcomeModal').classList.add('hidden');
  }
  if($('continueGuest'))$('continueGuest').onclick=()=>{localStorage.setItem('floxzert-guest','true');updateAiAccess();showTourStep(0)};
  if($('openLocalAccount'))$('openLocalAccount').onclick=()=>{$('welcomeModal').classList.add('hidden');$('settingsModal').classList.remove('hidden');document.querySelector('[data-settings-tab="account"]').click()};
  if($('restartGuide'))$('restartGuide').onclick=()=>{$('settingsModal').classList.add('hidden');localStorage.removeItem('floxzert-welcome');$('welcomeContent').classList.remove('hidden');$('tourPanel').classList.add('hidden');$('welcomeModal').classList.remove('hidden')};
  $('tourBack').onclick=()=>showTourStep(tourIndex-1);
  $('tourNext').onclick=()=>{if(tourIndex>=onboardingSteps.length-1)finishTour();else showTourStep(tourIndex+1)};
  function initializeAccountOnboarding(){
    const timezoneSelect=$('accountTimezone');
    if(timezoneSelect){
      const zones=Intl.supportedValuesOf?Intl.supportedValuesOf('timeZone'):['UTC','Europe/Kyiv','Europe/Berlin','America/New_York','Asia/Tokyo'];
      timezoneSelect.replaceChildren();
      [...new Set(['UTC',Intl.DateTimeFormat().resolvedOptions().timeZone,...zones])].filter(Boolean).forEach(zone=>{
        const option=document.createElement('option');option.value=zone;option.textContent=zone.replaceAll('_',' ');timezoneSelect.appendChild(option);
      });
    }
    const savedProfile=JSON.parse(localStorage.getItem('floxzert-account')||'null');
    if(savedProfile){
      $('accountEmail').value=savedProfile.email||'';$('accountName').value=savedProfile.name||'';$('accountLanguage').value=savedProfile.language||'ru';if(savedProfile.timezone)timezoneSelect.value=savedProfile.timezone;$('accountPlan').value=savedProfile.plan||'free';$('accountConsent').checked=Boolean(savedProfile.consent);
      const avatar=savedProfile.avatar||localStorage.getItem('floxzert-account-avatar')||'';$('accountAvatarPreview').textContent=savedProfile.name?.trim()?.charAt(0)?.toUpperCase()||'A';$('accountAvatarPreview').style.backgroundImage=avatar?'url('+avatar+')':'';$('accountAvatarPreview').style.backgroundSize=avatar?'cover':'';$('accountAvatarPreview').style.backgroundPosition=avatar?'center':'';
      const planLimits={free:'100 ИИ-токенов/день',creator:'500 ИИ-токенов/день',team:'2 000 ИИ-токенов/день'};
      $('accountStatus').textContent=`Локальный профиль: ${savedProfile.name||savedProfile.email||'без имени'} · ${planLimits[savedProfile.plan||'free']} · облачная синхронизация отключена`;
    }
    if(cloudApiBase){
      const token=localStorage.getItem('floxzert-cloud-token');
      setAccountMode(token?'login':'register');
      $('accountModeHint').textContent=desktopLocalAI
        ?'Аккаунты и проекты хранятся на сервере. Desktop подключается без CAPTCHA.'
        :turnstileSiteKey
          ?'Регистрация в веб-версии защищена Cloudflare Turnstile. Пароль никогда не сохраняется в браузере.'
          :'Владелец сервиса должен настроить Cloudflare Turnstile и адрес API перед веб-регистрацией.';
      if(token){
        fetch('/api/auth/me').then(async response=>{
          const result=await response.json();
          if(response.status===401){
            localStorage.removeItem('floxzert-cloud-token');
            setAccountMode('register');
            $('accountStatus').textContent='Сеанс истёк. Войдите снова для облачной синхронизации.';
            return;
          }
          if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
          const profile={
            email:result.user.email,name:result.user.name||'',
            language:savedProfile?.language||'ru',
            timezone:savedProfile?.timezone||'',
            plan:result.user.plan||'free',
            consent:Boolean(savedProfile?.consent)
          };
          localStorage.setItem('floxzert-account',JSON.stringify(profile));
          $('accountName').value=profile.name||'';
          $('accountStatus').textContent=`Вход выполнен: ${profile.name||profile.email} · облачная синхронизация включена`;
        }).catch(error=>{
          console.error('Cloud account session could not be checked',error);
          $('accountStatus').textContent='Не удалось проверить облачный сеанс. Проверьте подключение к серверу.';
        });
      }else{
        $('accountStatus').textContent='Создайте аккаунт или войдите, чтобы синхронизировать проекты.';
      }
      initializeAccountCaptcha();
    }else{
      setAccountMode('register');
      $('accountModeHint').textContent='Облачный сервер пока не настроен. Сейчас профиль и проекты доступны локально на этом устройстве.';
    }
  }
  $('chooseAccountAvatar').onclick=()=>$('accountAvatar').click();
  $('accountAvatar').onchange=event=>{
    const file=event.target.files?.[0];if(!file)return;
    if(file.size>2*1024*1024){notify('Аватар должен быть меньше 2 МБ');event.target.value='';return}
    const reader=new FileReader();reader.onload=()=>{const avatar=String(reader.result);localStorage.setItem('floxzert-account-avatar',avatar);$('accountAvatarPreview').textContent='';$('accountAvatarPreview').style.backgroundImage=`url(${avatar})`;$('accountAvatarPreview').style.backgroundSize='cover';$('accountAvatarPreview').style.backgroundPosition='center';notify('Аватар готов к сохранению профиля')};reader.readAsDataURL(file);
  };
  initializeAccountOnboarding();
  updateAiAccess();
  async function initializeMultiplayerIdentity(){
    if(!apiReady)return;
    const profile=JSON.parse(localStorage.getItem('floxzert-account')||'null');
    if(!profile?.email)return;
    try{
      const response=await fetch('/api/multiplayer/identity',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:profile.email,name:profile.name||'',plan:profile.plan||'free'})});
      const result=await response.json();if(response.ok&&result.user)multiplayerUserId=result.user.id;
    }catch(error){console.warn('Could not initialize multiplayer identity',error)}
  }
  const savedSupportProfile=JSON.parse(localStorage.getItem('floxzert-account')||'null');
  if(savedSupportProfile)$('supportName').value=savedSupportProfile.name||'';
  function syncEditorControls(){
    $('backgroundColor').value=settings.background_color||'#fbfaf7';
    settings.brush_size=Math.max(1,Math.min(80,Number(settings.brush_size)||8));settings.blur_radius=Math.max(1,Math.min(80,Number(settings.blur_radius)||8));
    settings.curve_smoothing=['off','manual','light','strong','geometry','curves','straight','auto','flox_ai'].includes(settings.curve_smoothing)?settings.curve_smoothing:'off';
    if(settings.curve_smoothing_enabled===true&&settings.curve_smoothing==='off')settings.curve_smoothing='light';
    settings.smoothing_sensitivity=Math.max(0,Math.min(100,Number(settings.smoothing_sensitivity)||0));
    settings.smoothing_jitter_threshold=Math.max(1,Math.min(30,Number(settings.smoothing_jitter_threshold)||6));
    $('brushSize').value=settings.brush_size;$('blurRadius').value=settings.blur_radius;
    $('gridToggle').classList.toggle('active',settings.grid_enabled===true);$('gridToggle').setAttribute('aria-pressed',String(settings.grid_enabled===true));
    $('gridSize').value=String(settings.grid_size||100);$('gridSnap').checked=settings.grid_snap_enabled===true;
    $('previewQuality').value=settings.preview_quality||'balanced';$('smoothingEnabled').checked=settings.curve_smoothing_enabled===true;
    $('smoothingMode').value=settings.curve_smoothing;$('smoothingSensitivity').value=settings.smoothing_sensitivity;$('smoothingSensitivityValue').textContent=`${settings.smoothing_sensitivity}%`;
    $('smoothingJitter').value=settings.smoothing_jitter_threshold;$('smoothingJitterValue').textContent=`${settings.smoothing_jitter_threshold} px`;
    settings.frame_quality_scale=[1,2,3,4].includes(Number(settings.frame_quality_scale))?Number(settings.frame_quality_scale):1;
    settings.stroke_color=/^#[0-9a-f]{6}$/i.test(settings.stroke_color||'')?settings.stroke_color:'#f0a36b';
    settings.fill_color=/^#[0-9a-f]{6}$/i.test(settings.fill_color||'')?settings.fill_color:'#f0a36b';
    settings.shadow_color=/^#[0-9a-f]{6}$/i.test(settings.shadow_color||'')?settings.shadow_color:'#20202a';
    settings.shadow_enabled=settings.shadow_enabled===true;
    syncFrameQualityLabel();syncColors()
  }
  const applyProjectDataBase=applyProjectData;
  applyProjectData=function(data){
    applyProjectDataBase(data);
    const savedSettings=data.settings||{};
    settings.background_color=data.background||savedSettings.background_color||'#fbfaf7';
    settings.grid_enabled=savedSettings.grid_enabled===true;
    settings.grid_size=[50,100,200,400].includes(Number(savedSettings.grid_size))?Number(savedSettings.grid_size):100;
    settings.grid_snap_enabled=savedSettings.grid_snap_enabled===true;
    settings.preview_quality=['draft','balanced','high'].includes(savedSettings.preview_quality)?savedSettings.preview_quality:'balanced';
    settings.curve_smoothing_enabled=typeof savedSettings.curve_smoothing_enabled==='boolean'?savedSettings.curve_smoothing_enabled:(savedSettings.curve_smoothing||'off')!=='off';
    if(settings.curve_smoothing_enabled&&settings.curve_smoothing==='off')settings.curve_smoothing='light';
    syncEditorControls();
    applyPreviewQuality()
  };
  applyPreviewQuality();
  document.addEventListener('pointerdown',event=>{activeShortcutContext=getShortcutContext(event.target)},true);
  document.addEventListener('keydown',handleShortcutKey);
  document.addEventListener('keyup',releaseHeldShortcut);
  window.addEventListener('blur',()=>{activeShortcutContext='global';clearPendingShortcutStates()});
  window.addEventListener('beforeunload',()=>{if(projectDirty){try{localStorage.setItem('floxzert-project',JSON.stringify(projectData()))}catch(error){console.error('Emergency local save failed',error)}}});
  renderLayers();renderTimeline();render();applyZoom();renderFeatureCatalog();renderLearning();initializeProjectStorage().finally(()=>{if(!cloudApiBase)initializeMultiplayerIdentity();if(desktopLocalAI)void refreshDesktopLocalAIStatus();loadAiProvider()});
  setInterval(()=>{
    if(!apiReady||!currentProjectId||saveInFlight||projectDirty||saveBlocked||document.hidden)return;
    fetch(`/api/projects/${encodeURIComponent(currentProjectId)}`).then(response=>response.json()).then(project=>{
      if(project.revision&&project.revision!==projectRevision&&project.data){
        projectRevision=project.revision;applyProjectData(project.data);render();renderLayers();renderTimeline();
        notify('Проект обновлён другим участником');
      }
    }).catch(error=>console.warn('Collaboration poll failed',error));
  },5000);
  if(!localStorage.getItem('floxzert-welcome'))$('welcomeModal').classList.remove('hidden');
  const savedProfile=JSON.parse(localStorage.getItem('floxzert-account')||'null');
  if(savedProfile&&!cloudApiBase){$('accountEmail').value=savedProfile.email||'';$('accountName').value=savedProfile.name||'';$('accountLanguage').value=savedProfile.language||'ru';$('accountStatus').textContent=`Локальный профиль: ${savedProfile.name||savedProfile.email||'без имени'} · облачная синхронизация отключена`}
  if(settings.theme)applyTheme(settings.theme);
})();
