<h1><i class="fa fa-dropbox"></i> Dropbox Accounts Social Authentication</h1>
<hr />

<form class="sso-dropbox">
	<div class="alert alert-warning">
		<p>
			Create a <strong>Dropbox API App</strong> via the
			<a href="https://www.dropbox.com/developers/apps">App Console</a> and then paste
			your application details here.
		</p>
		<br />
		<input type="text" name="id" title="Client ID" class="form-control input-lg" placeholder="Client ID"><br />
		<input type="text" name="secret" title="Client Secret" class="form-control" placeholder="Client Secret">
		<p class="help-block">
			The appropriate "Redirect URI" is your NodeBB's URL with `/auth/dropbox/callback` appended to it.
		</p>
	</div>
</form>

<button class="btn btn-lg btn-primary" type="button" id="save">Save</button>

<script>
	require(['settings'], function(Settings) {
		Settings.load('sso-dropbox', $('.sso-dropbox'));

		$('#save').on('click', function() {
			Settings.save('sso-dropbox', $('.sso-dropbox'));
		});
	});
</script>