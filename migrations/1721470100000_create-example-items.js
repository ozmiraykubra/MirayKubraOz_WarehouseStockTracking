// Bu dosya bir ÖRNEKTİR. Kendi domain tablonuzu (customers, tasks, employees, appointments vb.)
// oluştururken bu pattern'i takip edin: company_id foreign key + gerekli alanlar.

exports.up = (pgm) => {
  pgm.createTable('example_items', {
    id: 'id',
    company_id: {
      type: 'integer',
      notNull: true,
      references: 'companies',
      onDelete: 'cascade',
    },
    name: { type: 'varchar(255)', notNull: true },
    status: { type: 'varchar(50)', notNull: true, default: 'active' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

};

exports.down = (pgm) => {
  pgm.dropTable('example_items');
};
