import io.github.treesitter.jtreesitter.Language;
import io.github.treesitter.jtreesitter.antlr4.TreeSitterAntlr4;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

public class TreeSitterAntlr4Test {
    @Test
    public void testCanLoadLanguage() {
        assertDoesNotThrow(() -> new Language(TreeSitterAntlr4.language()));
    }
}
