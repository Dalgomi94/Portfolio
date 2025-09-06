    $("#test").on("click", () => {
        console.log("abc")
    
        $.ajax({
            url: "test_ajax",
            type: "GET",
            success: function(response) {
                alert(response.Good);
            },
            error: function(xhr, status, error) {
                alert("에러 발생: " + error);
            }
        });
    });
