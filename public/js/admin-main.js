(function () {
  if ($("textarea#ta").length) {
    CKEDITOR.replace("ta");
  }
})();
$("a.confirmDelete").on("click", function () {
  if (!confirm("Click 'OK' to Confirm  Deletion")) return false;
});
