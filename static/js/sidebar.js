// sidebar.js : sidebar interactions (category list, post list, delete)
(function(){
  const App = (window.App = window.App || {});
  App.sidebar = {
    init(){
      const { els, state, render } = App;

      // category list delegation
      els.catList.addEventListener('click', (e)=>{
        const item = e.target.closest('.cat-item');
        const addBtn = e.target.closest('.add-post');
        const delBtn = e.target.closest('.del-cat');

        if(addBtn){
          const cid = addBtn.closest('.cat-item')?.getAttribute('data-cid') || state.activeCategory;
          App.modal.openPostDialog(cid);
          return;
        }
        if(delBtn){
          const cid = delBtn.closest('.cat-item')?.getAttribute('data-cid');
          if(!cid || cid==='all') return;
          if(!confirm('카테고리를 삭제할까요? 해당 글은 "일상"으로 이동합니다.')) return;
          state.posts = state.posts.map(p=> p.categoryId===cid ? {...p, categoryId:'65ox2k2y'} : p);
          state.categories = state.categories.filter(c=>c.id!==cid);
          if(state.activeCategory===cid) state.activeCategory='65ox2k2y';
          render.rerender();
          return;
        }
        if(item){
          state.activeCategory = item.getAttribute('data-cid');
          render.renderCats();
          render.renderPosts();
        }
      });

      // search
      els.search.addEventListener('input', ()=>{ render.renderPosts(); });

      // post list -> open article
      els.postList.addEventListener('click', (e)=>{
        const card = e.target.closest('.post-card'); if(!card) return;
        state.selectedPostId = card.getAttribute('data-pid');
        render.renderArticle();
        App.persist();
      });

      // delete current post
      els.btnDeletePost.addEventListener('click', ()=>{
        const id = state.selectedPostId; if(!id) return;
        if(!confirm('이 글을 삭제할까요?')) return;
        const idx = state.posts.findIndex(p=>p.id===id);
        state.posts = state.posts.filter(p=>p.id!==id);
        state.selectedPostId = state.posts[Math.max(0, idx-1)]?.id || null;
        render.rerender();
      });
    }
  };
})();
