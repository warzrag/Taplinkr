-- Jeton anonyme depose par VenusBot dans l'adresse du lien (?vb=).
-- Il relie un clic a la conversation qui a envoye le lien, sans stocker
-- ni le pseudo ni l'identifiant du fan.
--
-- Colonne nullable et index additionnel : aucun impact sur les donnees
-- existantes, aucune reecriture de table.

ALTER TABLE "clicks" ADD COLUMN "fanToken" TEXT;

CREATE INDEX "clicks_fanToken_idx" ON "clicks"("fanToken");
