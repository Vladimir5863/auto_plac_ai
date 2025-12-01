$form = @{username='marko@example.com'; password='password123'}
$response = Invoke-WebRequest -Uri "http://localhost:8000/auth/login" -Method POST -Body $form -ContentType "application/x-www-form-urlencoded" -UseBasicParsing
Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
