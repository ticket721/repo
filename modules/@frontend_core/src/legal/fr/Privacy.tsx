import React from 'react';

const Privacy = (): JSX.Element => {
    return (
        <div
            style={{
                wordWrap: 'break-word',
                padding: 16,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            lang='EN-US'
        >
            <div
                className='WordSection1'
                style={{
                    maxWidth: 600,
                }}
            >
                <p
                    style={{whiteSpace: 'pre-line'}}
                >{`
                Politique de confidentialité et Protection des données

TICKET721 en tant que Sous-traitant du Responsable de traitement, l’Organisateur, est amené à recueillir et traiter des données vous concernant, conformément à la Loi Informatique & Libertés du 6 janvier 1978 dans sa version modifiée et le Règlement Général sur la Protection des Données n°2016/679.
Dans le cadre de la fourniture des services de l’Application, nous collectons notamment les données suivantes :
-\tNom
-\tPrénom
-\tAdresse e-mail
D’autres données peuvent être demandées par l’Organisateur notamment (liste non exhaustive) :
-\tTéléphone
-\tAdresse
-\tDate de naissance
-\tAge
Ces données ont les finalités suivantes :
-\tGarantir la sécurité de l’Evénement
-\tPermettre d’identifier chacun des participants de l’Evénement
-\tCommuniquer avec les participants quant au déroulement de l’Evènement

Nous utilisons aussi l’authentification Google (sans utilisation des services Google) et nous récupérons ainsi de l’utilisateur, son :
-\tID
-\tPhoto de profil
-\tNom
-\tPrénom
-\tLocale (langue)
Ces données ont les finalités suivantes :
-\tPermettre l’authentification des utilisateurs sur l’Application Ticket721 via le service d’authentification Google
-\tPermettre la personnalisation de l’Application en lui proposant l’image de profil Google et la langue de son pays d’utilisation (si celle si est prise en charge par Ticket721).
Les données supplémentaires demandées dans le cadre d’un Evénement ne pourront être utilisées que pour ce même Evènement. Leur liste est accessible sur demande conformément à la Loi Informatique & Libertés du 6 janvier 1978, dans sa version modifiée.
Lors d’un Achat nos prestataires bancaires collectent et traitent également des Données Personnelles concernant vos moyens de paiement (numéro de carte bancaire, date de fin de validité de la carte bancaire, cryptogramme visuel, ce dernier n’étant pas conservé, etc.). Ils collectent également des informations relatives au règlement des factures émises depuis ou via la Plateforme.
Enfin sont également collectées les Données nécessaires afin de mémoriser les préférences du Client en termes de communications (canal, contenu, fréquence) et d’affichage sur la Plateforme, afin de pouvoir lui proposer une expérience personnalisée.
Ces données sont hébergées au sein de l’Union Européenne et ne sont transférées dans aucun pays tiers. Ces dernières sont également conservées la durée strictement nécessaire au traitement telle que définie par la loi en vigueur, dans le cadre de nos obligations légales, à savoir 3 ans après le dernier contact de nos prospects et clients et jusqu’à 5 ans maximum afin de respecter les obligations quant à la prescription quinquennale.
Les destinataires de ces données sont l’Organisateur, ainsi que tous ses partenaires et sous-traitants, notamment TICKET721. L’Organisateur s’assure du respect de la réglementation afférente à la protection des données personnelles par ces derniers. Enfin, l’Organisateur peut également communiquer les données personnelles afin de coopérer avec les autorités administratives et judiciaires.
L’Organisateur et TICKET721 prendrons toutes les mesures nécessaires pour assurer la confidentialité et la sécurité des données personnelles de ses Utilisateurs. Il prévoit entre autres toutes les mesures techniques afin que ces dernières ne soient déformées, endommagées ou communiquées à des personnes non autorisées.
Enfin, conformément à la Loi Informatique & Libertés du 6 janvier 1978, dans sa version modifiée, l’Utilisateur dispose d’un droit d’accès, de rectification, de suppression, d’un droit d’opposition et d’un droit d’exportation de vos données personnelles. Vous pouvez exercer ce droit à tout moment en nous contactant à l’adresse postale suivante : 123-125 rue Pelleport, 75020, Paris ou par mail à l’adresse suivante : contact@ticket72.com Le délai de réponse est d’un mois à compter de la réception de la demande, sauf exception.
Pour toute information complémentaire, nous vous renvoyons à notre Politique de confidentialité, ci-joint.
Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL via son site internet.
                `}</p>
            </div>
        </div>
    );
};

export default Privacy;
