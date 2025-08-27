// ====== State & Storage ======
const STORAGE_KEY = 'portfolio_blog_v1';
const load = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
    } catch {
        return null;
    }
};
const save = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
    }
};
const uid = () => Math.random().toString(36).slice(2, 10);

const initial = load();
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const state = {
    theme: initial?.theme || (prefersDark ? 'dark' : 'light'),
    blogTitle: initial?.blogTitle || '나의 블로그',
    bannerUrl: initial?.bannerUrl || '',
    bannerHeight: initial?.bannerHeight || 220,
    categories: initial?.categories || [{id: 'all', name: '전체'}, {id: uid(), name: '일상'}, {id: uid(), name: '개발'}],
    posts: initial?.posts || [{
        id: uid(),
        title: '첫 글 예시',
        content: '여기에 **마크다운**으로 글을 쓸 수 있어요.\n\n- 좌측 카테고리 옆 **＋** 로 바로 글 작성\n- 배너 이미지는 상단에서 편집 버튼으로 설정\n- 달 아이콘으로 다크모드 전환',
        categoryId: null,
        createdAt: new Date().toISOString()
    }],
    activeCategory: initial?.activeCategory || 'all',
    selectedPostId: initial?.selectedPostId || null,
};
if (!state.posts[0].categoryId) state.posts[0].categoryId = state.categories[1]?.id || 'all';

function persist() {
    save(state);
}

// ====== Markdown (mini) ======
function escapeHtml(s) {
    return s.replace(/[&<>\"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"}[c]));
}

function md(src) {
    let out = '';
    const lines = String(src).replace(/\r/g, '').split('\n');
    let i = 0, inFence = false, fenceBuf = [];
    while (i < lines.length) {
        const line = lines[i];
        const fence = line.match(/^```(.*)$/);
        if (fence) {
            if (!inFence) {
                inFence = true;
                fenceBuf = [];
            } else {
                out += `<pre><code>${escapeHtml(fenceBuf.join('\n'))}</code></pre>`;
                inFence = false;
            }
            i++;
            continue;
        }
        if (inFence) {
            fenceBuf.push(line);
            i++;
            continue;
        }

        if (/^###\s+/.test(line)) {
            out += `<h3>${escapeHtml(line.replace(/^###\s+/, ''))}</h3>`;
            i++;
            continue;
        }
        if (/^##\s+/.test(line)) {
            out += `<h2>${escapeHtml(line.replace(/^##\s+/, ''))}</h2>`;
            i++;
            continue;
        }
        if (/^#\s+/.test(line)) {
            out += `<h1>${escapeHtml(line.replace(/^#\s+/, ''))}</h1>`;
            i++;
            continue;
        }
        if (/^\s*[-*]\s+/.test(line)) {
            let buf = [];
            while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
                buf.push(lines[i].replace(/^\s*[-*]\s+/, ''));
                i++;
            }
            out += '<ul>' + buf.map(li => `<li>${inline(li)}</li>`).join('') + '</ul>';
            continue;
        }
        if (line.trim() === '') {
            i++;
            continue;
        }
        out += `<p>${inline(line)}</p>`;
        i++;
    }
    return out;
}

function inline(t) {
    t = escapeHtml(t);
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    return t;
}

// ====== Elements ======
const els = {
    blogTitleH1: document.getElementById('blogTitleH1'),
    heroTitle: document.getElementById('heroTitle'),
    heroImg: document.getElementById('heroImg'),
    postList: document.getElementById('postList'),
    catList: document.getElementById('catList'),
    search: document.getElementById('search'),
    emptyHint: document.getElementById('emptyHint'),
    article: document.getElementById('article'),
    articleMeta: document.getElementById('articleMeta'),
    articleTitle: document.getElementById('articleTitle'),
    articleBody: document.getElementById('articleBody'),
    articleDate: document.getElementById('articleDate'),
    btnDeletePost: document.getElementById('btnDeletePost'),
    themeIcon: document.getElementById('themeIcon'),
};

// ====== Theme ======
function setTheme(t) {
    state.theme = t;
    document.documentElement.setAttribute('data-theme', t);
    persist();
}

function toggleTheme() {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
}

// ====== Renderers ======
function prettyDate(iso) {
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
}

function renderTop() {
    els.blogTitleH1.textContent = state.blogTitle;
    els.heroTitle.textContent = state.blogTitle;
}

function renderBanner() {
    els.heroImg.style.height = state.bannerHeight + 'px';
    document.querySelector('.hero').style.height = state.bannerHeight + 'px';
    els.heroImg.style.backgroundImage = state.bannerUrl ? `url(${state.bannerUrl})` : 'linear-gradient(90deg, #cbd5e1, #e2e8f0)';
}

function renderCats() {
    const html = state.categories.map(c => {
        const active = state.activeCategory === c.id ? 'cat-item active' : 'cat-item';
        return `<div class="${active}" data-cid="${c.id}">
      <span class="name">${c.name}</span>
      <span class="cat-actions">
        ${c.id !== 'all' ? `<button class="add-post" title="글 추가">＋</button>` : ''}
        ${c.id !== 'all' ? `<button class="del-cat" title="카테고리 삭제">🗑</button>` : ''}
      </span>
    </div>`;
    }).join('');
    els.catList.innerHTML = html;
}

function filteredPosts() {
    const term = (els.search.value || '').toLowerCase();
    return state.posts
        .filter(p => state.activeCategory === 'all' ? true : p.categoryId === state.activeCategory)
        .filter(p => !term ? true : (p.title.toLowerCase().includes(term) || p.content.toLowerCase().includes(term)))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderPosts() {
    const list = filteredPosts();
    if (!list.length) {
        els.postList.innerHTML = '<div class="muted pad">해당 카테고리에 글이 없습니다.</div>';
    } else {
        els.postList.innerHTML = list.map(p => {
            const cname = state.categories.find(c => c.id === p.categoryId)?.name || '전체';
            return `<div class="post-card" data-pid="${p.id}">
        <div class="hd">${p.title}</div>
        <div class="meta"><span class="badge"># ${cname}</span><span>${prettyDate(p.createdAt)}</span></div>
      </div>`;
        }).join('');
    }
}

function renderArticle() {
    const post = state.posts.find(p => p.id === state.selectedPostId);
    if (!post) {
        els.emptyHint.style.display = 'block';
        els.article.classList.add('hidden');
        return;
    }
    els.emptyHint.style.display = 'none';
    els.article.classList.remove('hidden');
    const cname = state.categories.find(c => c.id === post.categoryId)?.name || '전체';
    els.articleMeta.innerHTML = `<span class="badge"># ${cname}</span> · ${prettyDate(post.createdAt)}`;
    els.articleTitle.textContent = post.title;
    els.articleBody.innerHTML = md(post.content);
    els.articleDate.textContent = `작성일: ${prettyDate(post.createdAt)}`;
}

function rerender() {
    renderTop();
    renderBanner();
    renderCats();
    renderPosts();
    renderArticle();
    persist();
}

// ====== Events ======
document.getElementById('btnTheme').addEventListener('click', () => {
    toggleTheme();
});

document.getElementById('btnBanner').addEventListener('click', () => {
    document.getElementById('inpBannerUrl').value = state.bannerUrl;
    document.getElementById('inpBannerH').value = state.bannerHeight;
    document.getElementById('dlgBanner').showModal();
});
document.getElementById('saveBanner').addEventListener('click', () => {
    state.bannerUrl = document.getElementById('inpBannerUrl').value.trim();
    state.bannerHeight = Math.max(140, Math.min(560, parseInt(document.getElementById('inpBannerH').value || 220)));
    rerender();
    document.getElementById('dlgBanner').close();
});
document.getElementById('inpBannerFile').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        document.getElementById('inpBannerUrl').value = String(reader.result);
    };
    reader.readAsDataURL(file);
});

document.getElementById('btnEditTitle').addEventListener('click', () => {
    document.getElementById('inpTitle').value = state.blogTitle;
    document.getElementById('dlgTitle').showModal();
});
document.getElementById('saveTitle').addEventListener('click', () => {
    const v = document.getElementById('inpTitle').value.trim() || '나의 블로그';
    state.blogTitle = v;
    rerender();
    document.getElementById('dlgTitle').close();
});

document.getElementById('btnAddCat').addEventListener('click', () => {
    document.getElementById('inpCatName').value = '';
    document.getElementById('dlgCat').showModal();
});
document.getElementById('saveCat').addEventListener('click', () => {
    const name = document.getElementById('inpCatName').value.trim();
    if (!name) return;
    if (state.categories.some(c => c.name === name)) return;
    const id = uid();
    state.categories.push({id, name});
    state.activeCategory = id;
    rerender();
    document.getElementById('dlgCat').close();
});

els.search.addEventListener('input', () => {
    renderPosts();
});

// Sidebar delegation
els.catList.addEventListener('click', (e) => {
    const item = e.target.closest('.cat-item');
    if (!item) return;
    const cid = item.getAttribute('data-cid');
    if (e.target.closest('.add-post')) {
        openPostDialog(cid);
        return;
    }
    if (e.target.closest('.del-cat')) {
        if (cid === 'all') return;
        deleteCategory(cid);
        return;
    }
    state.activeCategory = cid;
    renderCats();
    renderPosts();
});

function deleteCategory(id) {
    if (!confirm('카테고리를 삭제할까요? 해당 글은 "전체"로 이동합니다.')) return;
    state.posts = state.posts.map(p => p.categoryId === id ? {...p, categoryId: 'all'} : p);
    state.categories = state.categories.filter(c => c.id !== id);
    if (state.activeCategory === id) state.activeCategory = 'all';
    rerender();
}

// Post list -> open article
els.postList.addEventListener('click', (e) => {
    const card = e.target.closest('.post-card');
    if (!card) return;
    state.selectedPostId = card.getAttribute('data-pid');
    renderArticle();
    persist();
});

// Delete current post
els.btnDeletePost.addEventListener('click', () => {
    const id = state.selectedPostId;
    if (!id) return;
    if (!confirm('이 글을 삭제할까요?')) return;
    const idx = state.posts.findIndex(p => p.id === id);
    state.posts = state.posts.filter(p => p.id !== id);
    state.selectedPostId = state.posts[Math.max(0, idx - 1)]?.id || null;
    rerender();
});

// New post dialog
function openPostDialog(catId) {
    const sel = document.getElementById('selPostCat');
    sel.innerHTML = state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    sel.value = catId || state.activeCategory || 'all';
    document.getElementById('inpPostTitle').value = '';
    document.getElementById('inpPostBody').value = '';
    document.getElementById('dlgPost').showModal();
}

document.getElementById('savePost').addEventListener('click', () => {
    const title = document.getElementById('inpPostTitle').value.trim();
    if (!title) return;
    const body = document.getElementById('inpPostBody').value;
    const cat = document.getElementById('selPostCat').value;
    const id = uid();
    const p = {id, title, content: body, categoryId: cat, createdAt: new Date().toISOString()};
    state.posts.unshift(p);
    state.selectedPostId = id;
    state.activeCategory = cat;
    rerender();
    document.getElementById('dlgPost').close();
});

// Theme init & first render
document.documentElement.setAttribute('data-theme', state.theme);
rerender();

// Self-tests (console)
(function tests() {
    try {
        console.group('%cSelf-tests', 'color:#16a34a');
        const a = uid(), b = uid();
        console.assert(a !== b, 'uid differ');
        const html = md('**bold** *it*');
        console.assert(html.includes('<strong>bold</strong>') && html.includes('<em>it</em>'), 'markdown');
        const before = document.documentElement.getAttribute('data-theme');
        toggleTheme();
        const after = document.documentElement.getAttribute('data-theme');
        console.assert(before !== after, 'theme');
        toggleTheme();
        console.groupEnd();
    } catch (e) {
        console.warn('Self-tests error', e);
    }
})();
