**************************
Read the Docs Sphinx Theme
**************************

.. image:: https://img.shields.io/pypi/v/sphinx_rtd_theme.svg
   :target: https://pypi.python.org/pypi/sphinx_rtd_theme
   :alt: Pypi Version
.. image:: https://travis-ci.org/readthedocs/sphinx_rtd_theme.svg?branch=master
   :target: https://travis-ci.org/readthedocs/sphinx_rtd_theme
   :alt: Build Status
.. image:: https://img.shields.io/pypi/l/sphinx_rtd_theme.svg
   :target: https://pypi.python.org/pypi/sphinx_rtd_theme/
   :alt: License
.. image:: https://readthedocs.org/projects/sphinx-rtd-theme/badge/?version=latest
  :target: http://sphinx-rtd-theme.readthedocs.io/en/latest/?badge=latest
  :alt: Documentation Status

This Sphinx_ theme was designed to provide a great reader experience for
documentation users on both desktop and mobile devices. This theme is used
primarily on `Read the Docs`_ but can work with any Sphinx project. You can find
a working demo of the theme in the `theme documentation`_

**************************************************************
Transaction Propagation and Isolation in Spring @Transactional
**************************************************************


1. Introduction
---------------


In this tutorial, we'll cover the @Transactional annotation and its isolation and propagation settings.


2. What Is @Transactional?
--------------------------


We can use @Transactional to wrap a method in a database transaction.


It allows us to set propagation, isolation, timeout, read-only, and rollback conditions for our transaction. Also, we can specify the transaction manager.


Spring creates a proxy or manipulates the class byte-code to manage the creation, commit, and rollback of the transaction. In the case of a proxy, Spring ignores @Transactional in internal method calls.


Simply put, if we have a method like callMethod and we mark it as @Transactional, Spring would wrap some transaction management code around the invocation:@Transactional method called:

.. parsed-literal::
createTransactionIfNecessary();
try {
    callMethod();
    commitTransactionAfterReturning();
} catch (exception) {
    completeTransactionAfterThrowing();
    throw exception;
}


We can put the annotation on definitions of interfaces, classes, or directly on methods. They override each other according to the priority order; from lowest to highest we have: Interface, superclass, class, interface method, superclass method, and class method.


Spring applies the class-level annotation to all public methods of this class that we did not annotate with @Transactional.


However, if we put the annotation on a private or protected method, Spring will ignore it without an error.


Let's start with an interface sample:

.. parsed-literal::
@Transactional
public interface TransferService {
    void transfer(String user1, String user2, double val);
}


Usually, it is not recommended to set the @Transactional on the interface. However, it is acceptable for cases like @Repository with Spring Data. We can put the annotation on a class definition to override the transaction setting of the interface/superclass:

.. parsed-literal::
@Service
@Transactional
public class TransferServiceImpl implements TransferService {
    @Override
    public void transfer(String user1, String user2, double val) {
        // ...
    }
}


Now let's override it by setting the annotation directly on the method:

.. parsed-literal::
@Transactional
public void transfer(String user1, String user2, double val) {
    // ...
}


3. Transaction Propagation
--------------------------


Propagation defines our business logic ‘s transaction boundary. Spring manages to start and pause a transaction according to our propagation setting.


Spring calls TransactionManager::getTransaction to get or create a transaction according to the propagation. It supports some of the propagations for all types of TransactionManager, but there are a few of them that only supported by specific implementations of TransactionManager.


Now let's go through the different propagations and how they work.


REQUIRED is the default propagation. Spring checks if there is an active transaction, then it creates a new one if nothing existed. Otherwise, the business logic appends to the currently active transaction:

.. parsed-literal::
@Transactional(propagation = Propagation.REQUIRED)
public void requiredExample(String user) {
    // ...
}


Also as REQUIRED is the default propagation, we can simplify the code by dropping it:

.. parsed-literal::
@Transactional
public void requiredExample(String user) {
    // ...
}


Let's see the pseudo-code of how transaction creation works for REQUIRED propagation:

.. parsed-literal::
if (isExistingTransaction()) {
    if (isValidateExistingTransaction()) {
        validateExisitingAndThrowExceptionIfNotValid();
    }
    return existing;
}
return createNewTransaction();


For SUPPORTS, Spring first checks if an active transaction exists. If a transaction exists, then the existing transaction will be used. If there isn't a transaction, it is executed non-transactional:

.. parsed-literal::
@Transactional(propagation = Propagation.SUPPORTS)
public void supportsExample(String user) {
    // ...
}


Let's see the transaction creation's pseudo-code for SUPPORTS:

.. parsed-literal::
if (isExistingTransaction()) {
    if (isValidateExistingTransaction()) {
        validateExisitingAndThrowExceptionIfNotValid();
    }
    return existing;
}
return emptyTransaction;


When the propagation is MANDATORY, if there is an active transaction, then it will be used. If there isn't an active transaction, then Spring throws an exception:

.. parsed-literal::
@Transactional(propagation = Propagation.MANDATORY)
public void mandatoryExample(String user) {
    // ...
}


And let's again see the pseudo-code:

.. parsed-literal::
if (isExistingTransaction()) {
    if (isValidateExistingTransaction()) {
        validateExisitingAndThrowExceptionIfNotValid();
    }
    return existing;
}
throw IllegalTransactionStateException;


For transactional logic with NEVER propagation, Spring throws an exception if there's an active transaction:

.. parsed-literal::
@Transactional(propagation = Propagation.NEVER)
public void neverExample(String user) {
    // ...
}


Let's see the pseudo-code of how transaction creation works for NEVER propagation:

.. parsed-literal::
if (isExistingTransaction()) {
    throw IllegalTransactionStateException;
}
return emptyTransaction;


Spring at first suspends the current transaction if it exists, then the business logic is executed without a transaction.

.. parsed-literal::
@Transactional(propagation = Propagation.NOT_SUPPORTED)
public void notSupportedExample(String user) {
    // ...
}


The JTATransactionManager supports real transaction suspension out-of-the-box. Others simulate the suspension by holding a reference to the existing one and then clearing it from the thread context


When the propagation is REQUIRES_NEW, Spring suspends the current transaction if it exists and then creates a new one:

.. parsed-literal::
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void requiresNewExample(String user) {
    // ...
}


Similar to NOT_SUPPORTED, we need the JTATransactionManager for actual transaction suspension.


And the pseudo-code looks like so:

.. parsed-literal::
if (isExistingTransaction()) {
    suspend(existing);
    try {
        return createNewTransaction();
    } catch (exception) {
        resumeAfterBeginException();
        throw exception;
    }
}
return createNewTransaction();


For NESTED propagation, Spring checks if a transaction exists, then if yes, it marks a savepoint. This means if our business logic execution throws an exception, then transaction rollbacks to this savepoint. If there's no active transaction, it works like REQUIRED.


DataSourceTransactionManager supports this propagation out-of-the-box. Also, some implementations of JTATransactionManager may support this.


JpaTransactionManager supports NESTED only for JDBC connections. However, if we set nestedTransactionAllowed flag to true, it also works for JDBC access code in JPA transactions if our JDBC driver supports savepoints.


Finally, let's set the propagation to NESTED:

.. parsed-literal::
@Transactional(propagation = Propagation.NESTED)
public void nestedExample(String user) {
    // ...
}


4. Transaction Isolation
------------------------


Isolation is one of the common ACID properties: Atomicity, Consistency, Isolation, and Durability. Isolation describes how changes applied by concurrent transactions are visible to each other.


Each isolation level prevents zero or more concurrency side effects on a transaction:


We can set the isolation level of a transaction by @Transactional::isolation. It has these five enumerations in Spring: DEFAULT, READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE.


The default isolation level is DEFAULT. So when Spring creates a new transaction, the isolation level will be the default isolation of our RDBMS. Therefore, we should be careful if we change the database.


We should also consider cases when we call a chain of methods with different isolation. In the normal flow, the isolation only applies when a new transaction created. Thus if for any reason we don't want to allow a method to execute in different isolation, we have to set TransactionManager::setValidateExistingTransaction to true. Then the pseudo-code of transaction validation will be:

.. parsed-literal::
if (isolationLevel != ISOLATION_DEFAULT) {
    if (currentTransactionIsolationLevel() != isolationLevel) {
        throw IllegalTransactionStateException
    }
}


Now let's get deep in different isolation levels and their effects.


READ_UNCOMMITTED is the lowest isolation level and allows for most concurrent access.


As a result, it suffers from all three mentioned concurrency side effects. So a transaction with this isolation reads uncommitted data of other concurrent transactions. Also, both non-repeatable and phantom reads can happen. Thus we can get a different result on re-read of a row or re-execution of a range query.


We can set the isolation level for a method or class:

.. parsed-literal::
@Transactional(isolation = Isolation.READ_UNCOMMITTED)
public void log(String message) {
    // ...
}


Postgres does not support READ_UNCOMMITTED isolation and falls back to READ_COMMITED instead. Also, Oracle does not support and allow READ_UNCOMMITTED.


The second level of isolation, READ_COMMITTED, prevents dirty reads.


The rest of the concurrency side effects still could happen. So uncommitted changes in concurrent transactions have no impact on us, but if a transaction commits its changes, our result could change by re-querying.


Here, we set the isolation level:

.. parsed-literal::
@Transactional(isolation = Isolation.READ_COMMITTED)
public void log(String message){
    // ...
}


READ_COMMITTED is the default level with Postgres, SQL Server, and Oracle.


The third level of isolation, REPEATABLE_READ, prevents dirty, and non-repeatable reads. So we are not affected by uncommitted changes in concurrent transactions.


Also, when we re-query for a row, we don't get a different result. But in the re-execution of range-queries, we may get newly added or removed rows.


Moreover, it is the lowest required level to prevent the lost update. The lost update occurs when two or more concurrent transactions read and update the same row. REPEATABLE_READ does not allow simultaneous access to a row at all. Hence the lost update can't happen.


Here is how to set the isolation level for a method:

.. parsed-literal::
@Transactional(isolation = Isolation.REPEATABLE_READ)
public void log(String message){
    // ...
}


REPEATABLE_READ is the default level in Mysql. Oracle does not support REPEATABLE_READ.


SERIALIZABLE is the highest level of isolation. It prevents all mentioned concurrency side effects but can lead to the lowest concurrent access rate because it executes concurrent calls sequentially.


In other words, concurrent execution of a group of serializable transactions has the same result as executing them in serial.


Now let's see how to set SERIALIZABLE as the isolation level:

.. parsed-literal::
@Transactional(isolation = Isolation.SERIALIZABLE)
public void log(String message){
    // ...
}


5. Conclusion
-------------


In this tutorial, we explored the propagation property of @Transaction in detail. Afterward, we learned about concurrency side effects and isolation levels.
