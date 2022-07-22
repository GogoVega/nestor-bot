<?php
// https://github.com/renzbobz/DiscordWebhook-PHP
require("DiscordWebhook.php");

$webhookurl = getenv("WEBHOOK_URL");

$timestamp = time();
$formatter = new IntlDateFormatter('fr_BE', IntlDateFormatter::FULL, IntlDateFormatter::SHORT, "Europe/Berlin");
$timestampFormatted = $formatter->format($timestamp);

$firstname = $_POST["firstname"] ?? "";
$lastname = $_POST["lastname"] ?? "";
$class = $_POST["class"] ?? "";
$filament = $_POST["filament"] ?? "";
$message = $_POST["message"] ?? "";

$fileBaseName = $_FILES["userfile"]["name"] ?? "";
$fileExtension = strtoupper(pathinfo($fileBaseName, PATHINFO_EXTENSION)) ?? "";
$fileName = ($timestamp . "-" . $fileBaseName);

function bannerError($msgError) {
  echo ($msgError . "<br>");
  echo "<script type='text/javascript'> alert('$msgError'); history.back(); </script>";
}

if (empty($firstname) || empty($lastname) || empty($class) || empty($filament))
  return bannerError("Informations manquantes !");

if (strlen($firstname) > 25)
  return bannerError("Tu me semble avoir un prénom bien trop long mon coco !");

if (strlen($lastname) > 25)
  return bannerError("Tu me semble avoir un nom bien trop long mon coco !");

if (strlen($message) > 1000)
  return bannerError("Message trop long !");

if (empty($fileBaseName))
  return bannerError("Pas de fichiers téléversé !");

if ($fileExtension != "STL")
  return bannerError("Désolé mais nous n'acceptons que les fichiers STL.");

if (empty($message)) $message = "Aucun message.";

$dw = new DiscordWebhook($webhookurl);

$icon = "https://cdn.prusa3d.com/content/images/product/default/3325.jpg";

$dw->setUsername("FabLAB");

$msg = $dw->newMessage()
->setContent("Et une nouvelle commande <@&994150523404030052>")
->setTitle("Résumé de votre commande")
->setDescription("Commande passée le $timestampFormatted")
->setColor("1B1B1B")
->setTimestamp()
->setAuthor("Impression 3D", null, $icon)
->setFooter("EPHEC - ISAT", $icon)
->addFields(
  ["Prénom", $firstname, true],
  ["Nom", $lastname, true],
  ["Classe", $class, true],
  ["Type imprimante et filament", $filament, false],
  ["Message", $message, false]
)
->addFile($_FILES["userfile"]["tmp_name"], $fileName);

$response = $msg->send(["wait_message" => true]);

if (!$response->success)
  return bannerError("Une erreur s'est produite pendant l'envoie de votre commande !");

?>
  <script type="text/javascript">
    window.location = "./passed_order.html";
  </script>
<?php

?>