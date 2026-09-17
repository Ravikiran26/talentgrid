package com.talentgrid.backend.user;

import java.util.Locale;

/** "  ravikiran RAVI  ravella " → "Ravikiran Ravi Ravella". Also capitalises after '-' and '\''. */
public final class NameNormalizer {

    private NameNormalizer() {}

    public static String normalize(String raw) {
        if (raw == null) return null;
        String collapsed = raw.trim().replaceAll("\\s+", " ");
        if (collapsed.isEmpty()) return collapsed;

        StringBuilder out = new StringBuilder(collapsed.length());
        boolean startOfWord = true;
        for (char c : collapsed.toLowerCase(Locale.ROOT).toCharArray()) {
            if (startOfWord && Character.isLetter(c)) {
                out.append(Character.toUpperCase(c));
                startOfWord = false;
            } else {
                out.append(c);
                startOfWord = c == ' ' || c == '-' || c == '\'' || c == '.';
            }
        }
        return out.toString();
    }
}
