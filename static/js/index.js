// index.js : core state, utils, renderers, theme, bootstrap
(function(){
  // Core namespace
  const App = (window.App = window.App || {});

  // ===== Storage & State =====
  const STORAGE_KEY = 'portfolio_blog_v1';
  function load(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch{ return null; } }
  function save(data){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch{} }
  const initial = load();
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  App.state = {
    theme: initial?.theme || (prefersDark ? 'dark' : 'light'),
    blogTitle: initial?.blogTitle || '나의 블로그',
    bannerUrl: initial?.bannerUrl || '',
    bannerHeight: initial?.bannerHeight || 220,
    categories: initial?.categories || [{id:'all',name:'전체'},{id:uid(),name:'일상'},{id:uid(),name:'개발'}, {id:uid(),name:'여행'}],
    posts: initial?.posts || [{
      id: uid(),
      title: '첫 글 예시',
      content: '여기에 **마크다운**으로 글을 쓸 수 있어요.\n\n- 좌측 카테고리 옆 **＋** 로 바로 글 작성\n- 배너는 상단에서 편집\n- 달 아이콘으로 다크모드 전환',
      categoryId: null,
      createdAt: new Date().toISOString()
    }],
    activeCategory: initial?.activeCategory || 'all',
    selectedPostId: initial?.selectedPostId || null,
  };
  if(!App.state.posts[0].categoryId) App.state.posts[0].categoryId = App.state.categories[1]?.id || 'all';

  // expose persist
  App.persist = function(){ save(App.state); };

  // ===== Utils (uid, markdown) =====
  function uid(){ return Math.random().toString(36).slice(2,10); }
  function escapeHtml(s){ return s.replace(/[&<>\"']/g, c=>({"&":"&amp;","<":"&lt;","&gt;":">","\"":"&quot;","'":"&#39;"}[c])); }
  function inline(t){
    t = escapeHtml(t);
    t = t.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
    t = t.replace(/\*(.+?)\*/g,'<em>$1</em>');
    t = t.replace(/`([^`]+)`/g,'<code>$1</code>');
    return t;
  }
  function md(src){
    let out=''; const lines = String(src||'').replace(/\r/g,'').split('\n'); let i=0, inFence=false, fenceBuf=[];
    while(i<lines.length){
      const line=lines[i]; const fence=line.match(/^```(.*)$/);
      if(fence){ if(!inFence){ inFence=true; fenceBuf=[]; } else { out += `<pre><code>${escapeHtml(fenceBuf.join('\n'))}</code></pre>`; inFence=false; } i++; continue; }
      if(inFence){ fenceBuf.push(line); i++; continue; }
      if(/^###\s+/.test(line)){ out += `<h3>${escapeHtml(line.replace(/^###\s+/,''))}</h3>`; i++; continue; }
      if(/^##\s+/.test(line)){ out += `<h2>${escapeHtml(line.replace(/^##\s+/,''))}</h2>`; i++; continue; }
      if(/^#\s+/.test(line)){ out += `<h1>${escapeHtml(line.replace(/^#\s+/,''))}</h1>`; i++; continue; }
      if(/^\s*[-*]\s+/.test(line)){ let buf=[]; while(i<lines.length && /^\s*[-*]\s+/.test(lines[i])){ buf.push(lines[i].replace(/^\s*[-*]\s+/,'')); i++; } out += '<ul>'+buf.map(li=>`<li>${inline(li)}</li>`).join('')+'</ul>'; continue; }
      if(line.trim()===''){ i++; continue; }
      out += `<p>${inline(line)}</p>`; i++;
    }
    return out;
  }
  App.utils = { uid, md };

  // ===== Elements =====
  App.els = {
    blogTitleH1: document.getElementById('blogTitleH1'),
    heroTitle:   document.getElementById('heroTitle'),
    heroImg:     document.getElementById('heroImg'),
    postList:    document.getElementById('postList'),
    catList:     document.getElementById('catList'),
    search:      document.getElementById('search'),
    emptyHint:   document.getElementById('emptyHint'),
    article:     document.getElementById('article'),
    articleMeta: document.getElementById('articleMeta'),
    articleTitle:document.getElementById('articleTitle'),
    articleBody: document.getElementById('articleBody'),
    articleDate: document.getElementById('articleDate'),
    btnDeletePost: document.getElementById('btnDeletePost'),
    themeIcon:   document.getElementById('themeIcon'),
  };

  // ===== Theme =====
  function setTheme(t) {
    App.state.theme = t;
    if (App.state.theme === 'dark') {
        document.getElementById('themeIcon-dark').style.display = 'none';
        document.getElementById('themeIcon-light').style.display = 'block';
        document.getElementById('plusicon-dark').style.display = 'none';
        document.getElementById('plusicon-light').style.display = 'block';
    } else {
        document.getElementById('themeIcon-dark').style.display = 'block';
        document.getElementById('themeIcon-light').style.display = 'none';
        document.getElementById('plusicon-dark').style.display = 'block';
        document.getElementById('plusicon-light').style.display = 'none';
    }
    document.documentElement.setAttribute('data-theme', t);
    App.persist();
}
  function toggleTheme(){ setTheme(App.state.theme==='dark' ? 'light' : 'dark'); }
  document.getElementById('btnTheme').addEventListener('click', toggleTheme);

  // ===== Renderers =====
  function prettyDate(iso){ try{ return new Date(iso).toLocaleString(); } catch{ return iso; } }
  function renderTop(){ App.els.blogTitleH1.textContent = App.state.blogTitle; App.els.heroTitle.textContent = App.state.blogTitle; }
  function renderBanner(){
    App.els.heroImg.style.height = App.state.bannerHeight + 'px';
    document.querySelector('.hero').style.height = App.state.bannerHeight + 'px';
    App.els.heroImg.style.backgroundImage = App.state.bannerUrl ? `url(${App.state.bannerUrl})` : 'linear-gradient(90deg, #cbd5e1, #e2e8f0)';
  }
  function renderCats(){
    const html = App.state.categories.map(c=>{
      const active = App.state.activeCategory === c.id ? 'cat-item active' : 'cat-item';
      return `<div class="${active}" data-cid="${c.id}">
        <span class="name">${c.name}</span>
        <span class="cat-actions">
          ${c.id !== 'all' ? `<button class="add-post" title="글 추가">＋</button>`:''}
          ${c.id !== 'all' ? `<button class="del-cat" title="카테고리 삭제">🗑</button>`:''}
        </span>
      </div>`;
    }).join('');
    App.els.catList.innerHTML = html;
  }
  function filteredPosts(){
    const term = (App.els.search.value||'').toLowerCase();
    return App.state.posts
      .filter(p => App.state.activeCategory==='all' ? true : p.categoryId === App.state.activeCategory)
      .filter(p => !term ? true : (p.title.toLowerCase().includes(term) || p.content.toLowerCase().includes(term)))
      .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  }
  function renderPosts(){
    const list = filteredPosts();
    if(!list.length){
      App.els.postList.innerHTML = '<div class="muted pad">해당 카테고리에 글이 없습니다.</div>';
    } else {
      App.els.postList.innerHTML = list.map(p=>{
        const cname = App.state.categories.find(c=>c.id===p.categoryId)?.name || '전체';
        return `<div class="post-card" data-pid="${p.id}">
          <div class="hd">${p.title}</div>
          <div class="meta"><span class="badge"># ${cname}</span><span>${prettyDate(p.createdAt)}</span></div>
        </div>`;
      }).join('');
    }
  }
  function renderArticle(){
    const post = App.state.posts.find(p=>p.id===App.state.selectedPostId);
    if(!post){ App.els.emptyHint.style.display='block'; App.els.article.classList.add('hidden'); return; }
    App.els.emptyHint.style.display='none';
    App.els.article.classList.remove('hidden');
    const cname = App.state.categories.find(c=>c.id===post.categoryId)?.name || '전체';
    App.els.articleMeta.innerHTML = `<span class="badge"># ${cname}</span> · ${prettyDate(post.createdAt)}`;
    App.els.articleTitle.textContent = post.title;
    App.els.articleBody.innerHTML = md(post.content);
    App.els.articleDate.textContent = `작성일: ${prettyDate(post.createdAt)}`;
  }
  function rerender(){ renderTop(); renderBanner(); renderCats(); renderPosts(); renderArticle(); App.persist(); }

  App.render = { renderTop, renderBanner, renderCats, renderPosts, renderArticle, rerender };

  // Init theme
  document.documentElement.setAttribute('data-theme', App.state.theme);

  // Bootstrap modules (modal first to expose openPostDialog, then sidebar)
  if(App.modal && typeof App.modal.init==='function') App.modal.init();
  if(App.sidebar && typeof App.sidebar.init==='function') App.sidebar.init();

  // First render
  rerender();

  // tiny self-tests
  try{
    console.group('%cSelf-tests','color:#16a34a');
    const a=uid(), b=uid(); console.assert(a!==b,'uid differ');
    const sample = md('**bold** *it*'); console.assert(sample.includes('<strong>bold</strong>') && sample.includes('<em>it</em>'),'md inline');
    const before = document.documentElement.getAttribute('data-theme'); toggleTheme(); const after = document.documentElement.getAttribute('data-theme'); console.assert(before!==after,'theme'); toggleTheme();
    console.groupEnd();
  }catch(e){ console.warn('Self-tests error', e); }
})();
