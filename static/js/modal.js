// modal.js : dialog-related behaviors (title/banner/category/post)
(function(){
  const App = (window.App = window.App || {});
  App.modal = {
    init(){
      const { state, render, utils } = App;

      // Title edit
      document.getElementById('btnEditTitle').addEventListener('click', ()=>{
        document.getElementById('inpTitle').value = state.blogTitle;
        document.getElementById('dlgTitle').showModal();
      });
      document.getElementById('saveTitle').addEventListener('click', ()=>{
        const v = document.getElementById('inpTitle').value.trim() || '나의 블로그';
        state.blogTitle = v;
        render.rerender();
        document.getElementById('dlgTitle').close();
      });

      // Banner edit
      document.getElementById('btnBanner').addEventListener('click', ()=>{
        document.getElementById('inpBannerUrl').value = state.bannerUrl;
        document.getElementById('inpBannerH').value = state.bannerHeight;
        document.getElementById('dlgBanner').showModal();
      });
      document.getElementById('saveBanner').addEventListener('click', ()=>{
        state.bannerUrl = document.getElementById('inpBannerUrl').value.trim();
        state.bannerHeight = Math.max(140, Math.min(560, parseInt(document.getElementById('inpBannerH').value||220)));
        render.rerender();
        document.getElementById('dlgBanner').close();
      });
      document.getElementById('inpBannerFile').addEventListener('change', (e)=>{
        const file = e.target.files && e.target.files[0]; if(!file) return;
        const reader = new FileReader();
        reader.onload = ()=>{ document.getElementById('inpBannerUrl').value = String(reader.result); };
        reader.readAsDataURL(file);
      });

      // Add category
      document.getElementById('btnAddCat').addEventListener('click', ()=>{
        document.getElementById('inpCatName').value='';
        document.getElementById('dlgCat').showModal();
      });
      document.getElementById('saveCat').addEventListener('click', ()=>{
        const name = document.getElementById('inpCatName').value.trim(); if(!name) return;
        if(state.categories.some(c=>c.name===name)) return;
        const id = utils.uid(); state.categories.push({id,name}); state.activeCategory = id;
        render.rerender();
        document.getElementById('dlgCat').close();
      });

      // New post
      function openPostDialog(catId){
        const sel = document.getElementById('selPostCat');
        sel.innerHTML = state.categories.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
        sel.value = catId || state.activeCategory || 'all';
        document.getElementById('inpPostTitle').value='';
        document.getElementById('inpPostBody').value='';
        document.getElementById('dlgPost').showModal();
      }
      document.getElementById('savePost').addEventListener('click', ()=>{
        const title = document.getElementById('inpPostTitle').value.trim(); if(!title) return;
        const body  = document.getElementById('inpPostBody').value;
        const cat   = document.getElementById('selPostCat').value;
        const id    = utils.uid();
        const p     = {id, title, content: body, categoryId: cat, createdAt: new Date().toISOString()};
        state.posts.unshift(p); state.selectedPostId = id; state.activeCategory = cat;
        render.rerender();
        document.getElementById('dlgPost').close();
      });

      // expose for sidebar
      App.modal.openPostDialog = openPostDialog;
    }
  };
})();
