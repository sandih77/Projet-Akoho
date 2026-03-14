const SQL_CONFLICT_NUMBERS = new Set([2601, 2627]);
const SQL_BAD_REQUEST_NUMBERS = new Set([245, 248, 295, 515, 547, 8114]);

const STATUS_LABELS = {
    400: 'Requete invalide',
    404: 'Ressource introuvable',
    409: 'Conflit de donnees',
    422: 'Donnees invalides',
    500: 'Erreur serveur'
};

function extractSqlNumber(err) {
    return (
        err?.number ??
        err?.originalError?.info?.number ??
        err?.originalError?.number ??
        err?.cause?.number ??
        null
    );
}

function inferStatusFromMessage(message) {
    const normalized = message.toLowerCase();

    if (/(non trouv|introuvable|not found|absent)/.test(normalized)) {
        return 404;
    }

    if (
        /(param[eè]tre|requis|invalide|impossible|doivent|coh[ée]rence|ant[ée]rieure|existe d[ée]j[aà]|invalid|missing|required|cannot|ne peut pas|aucun)/.test(
            normalized
        )
    ) {
        return 400;
    }

    return 500;
}

export function formatError(err) {
    const explicitStatus = Number(err?.statusCode ?? err?.status ?? 0);
    const sqlNumber = extractSqlNumber(err);

    let status = explicitStatus;
    if (!Number.isInteger(status) || status < 400 || status > 599) {
        if (sqlNumber && SQL_CONFLICT_NUMBERS.has(sqlNumber)) {
            status = 409;
        } else if (sqlNumber && SQL_BAD_REQUEST_NUMBERS.has(sqlNumber)) {
            status = 400;
        } else {
            status = inferStatusFromMessage(String(err?.message ?? ''));
        }
    }

    const error = err?.error ?? STATUS_LABELS[status] ?? STATUS_LABELS[500];
    const details = err?.details ?? err?.message ?? 'Une erreur inattendue est survenue.';
    const code = String(err?.code ?? (sqlNumber ? `SQL_${sqlNumber}` : `HTTP_${status}`));

    return {
        status,
        payload: {
            error,
            details,
            code
        }
    };
}

export function sendError(res, err) {
    const { status, payload } = formatError(err);
    return res.status(status).json(payload);
}
