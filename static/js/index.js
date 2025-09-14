// const template_category =
// `<div class="${active}" data-cid="${c.id}">
//         <span class="name">${c.name}</span>
//         <span class="cat-actions">
//           ${c.id !== 'all' ? `<button class="add-post" title="글 추가">＋</button>`:''}
//           ${c.id !== 'all' ? `<button class="del-cat" title="카테고리 삭제">🗑</button>`:''}
//         </span>
//       </div>`

$(document).ready(function()
{
  console.log('asdasdasd')
})

$('.cat-item').on('click', function (e)
  {
    console.log('e :', e)
    console.log('e.target : ', e.target)
    console.log('cid :', $(e.target).data('cid'))
    console.log('classname :', e.target.className)

    let seq = 0;
    let ele = undefined;

    if (e.target.className.includes('cat-item')) {
      ele = $(e.target);
      seq = parseInt(ele.data('cid'));
    }
  
    else if (e.target.className.includes('name')) {
      ele = $($(e.target).parent()[0]);
      seq = parseInt(ele.data('cid'));
    } 
    
    else if (e.target.className.includes('add-post') || e.target.className.includes('del-cat')) {
      ele = $($(e.target).parent().parent()[0]);
      seq = parseInt(ele.data('cid'));
    }

    $.ajax({
      url: 'ajax/index_data_save',
      type: 'POST',
      data: {
        seq: seq
      },
      success: function (response) {
        $('.CONTENT_SECTION')[0].innerHTML = response.content;
        ele.siblings().removeClass('active');
        ele.addClass('active');
      },
      error: function (xhr, status, error) {
        console.log('ERROR : ', xhr, status, error);
      }
    })
  })